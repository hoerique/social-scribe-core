const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  async function log(tipo: string, modulo: string, mensagem: string, detalhes?: any, duracao_ms?: number) {
    await supabase.from('system_logs').insert({ tipo, modulo, mensagem, detalhes, duracao_ms });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { username, api_key } = body;

    // Get API key from body or config
    let apiKey = api_key;
    if (!apiKey) {
      const { data: config } = await supabase.from('configuracoes').select('valor').eq('chave', 'apify_api_key').single();
      apiKey = config?.valor;
    }

    if (!apiKey) {
      await log('erro', 'scraper', 'API Key não configurada');
      return new Response(JSON.stringify({ success: false, error: 'API Key não configurada. Adicione sua API Key nas configurações.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get profiles to scrape
    let perfis: any[] = [];
    if (username) {
      const { data } = await supabase.from('perfis_monitorados').select('*').eq('username', username).eq('ativo', true);
      perfis = data || [];
      if (perfis.length === 0) {
        // Auto-create profile if not exists
        const { data: newPerfil } = await supabase.from('perfis_monitorados').insert({ username, plataforma: 'instagram' }).select().single();
        if (newPerfil) perfis = [newPerfil];
      }
    } else {
      const { data } = await supabase.from('perfis_monitorados').select('*').eq('ativo', true);
      perfis = data || [];
    }

    if (perfis.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Nenhum perfil ativo para coletar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results: any[] = [];

    for (const perfil of perfis) {
      const startTime = Date.now();
      await log('info', 'scraper', `Iniciando coleta: @${perfil.username}`);
      await supabase.from('perfis_monitorados').update({ status: 'coletando' }).eq('id', perfil.id);

      try {
        // Call Apify API to scrape Instagram profile
        const apifyResponse = await fetch(
          `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usernames: [perfil.username],
              resultsLimit: 30,
            }),
          }
        );

        if (!apifyResponse.ok) {
          const errText = await apifyResponse.text();
          throw new Error(`Apify API error ${apifyResponse.status}: ${errText}`);
        }

        const apifyData = await apifyResponse.json();
        
        if (!apifyData || apifyData.length === 0) {
          throw new Error('Nenhum dado retornado pela API');
        }

        let insertedCount = 0;
        let updatedCount = 0;

        for (const item of apifyData) {
          // Extract profile data and posts
          const profileData = {
            nome_perfil_analisado: perfil.username,
            perfil_nome: item.fullName || item.profileName,
            perfil_username: item.username || perfil.username,
            perfil_biografia: item.biography || item.bio,
            perfil_seguidores: item.followersCount || item.followers,
            perfil_seguindo: item.followingCount || item.following,
            perfil_posts_total: item.postsCount || item.posts,
            perfil_privado: item.isPrivate || false,
            perfil_url_bio: item.externalUrl || item.website,
            perfil_categoria: item.businessCategory || item.category,
            perfil_foto_url: item.profilePicUrl || item.profilePicture,
          };

          // If item has posts, process each one
          const posts = item.latestPosts || item.posts || [];
          if (Array.isArray(posts) && posts.length > 0) {
            for (const post of posts) {
              const hashtags = extractHashtags(post.caption || post.text || '');
              const engagementRate = calculateEngagement(
                (post.likesCount || post.likes || 0),
                (post.commentsCount || post.comments || 0),
                profileData.perfil_seguidores || 1
              );

              const coleta = {
                ...profileData,
                data_coleta: new Date().toISOString(),
                post_id: post.id || post.shortCode || post.url,
                post_link: post.url || (post.shortCode ? `https://www.instagram.com/p/${post.shortCode}/` : null),
                post_data: post.timestamp || post.takenAt || post.date,
                post_legenda: post.caption || post.text,
                post_tipo: post.type || (post.videoUrl ? 'video' : 'image'),
                post_qtd_midias: post.images?.length || post.displayResources?.length || 1,
                post_midias_info: post.displayResources || post.images || null,
                metricas_curtidas: post.likesCount || post.likes || 0,
                metricas_comentarios: post.commentsCount || post.comments || 0,
                metricas_compartilhamentos: post.sharesCount || 0,
                metricas_salvamentos: post.savesCount || 0,
                metricas_video_views: post.videoViewCount || post.videoPlayCount || 0,
                metricas_video_duracao: post.videoDuration || null,
                hashtags_lista: hashtags,
                hashtags_qtd: hashtags.length,
                localizacao_nome: post.locationName || post.location?.name || null,
                calc_taxa_engajamento: engagementRate,
              };

              // Upsert - avoid duplicates
              const { data: existing } = await supabase
                .from('coletas')
                .select('id')
                .eq('nome_perfil_analisado', perfil.username)
                .eq('post_id', coleta.post_id)
                .maybeSingle();

              if (existing) {
                await supabase.from('coletas').update(coleta).eq('id', existing.id);
                updatedCount++;
              } else {
                await supabase.from('coletas').insert(coleta);
                insertedCount++;
              }
            }
          } else {
            // Profile-only data (no posts)
            const coleta = {
              ...profileData,
              data_coleta: new Date().toISOString(),
              calc_taxa_engajamento: 0,
            };
            await supabase.from('coletas').insert(coleta);
            insertedCount++;
          }
        }

        const duration = Date.now() - startTime;
        await supabase.from('perfis_monitorados').update({
          status: 'sucesso',
          ultima_coleta: new Date().toISOString(),
          total_coletas: (perfil.total_coletas || 0) + 1,
          erro_ultima_coleta: null,
        }).eq('id', perfil.id);

        await log('sucesso', 'scraper', `Coleta concluída: @${perfil.username} - ${insertedCount} novos, ${updatedCount} atualizados`, { insertedCount, updatedCount }, duration);
        results.push({ username: perfil.username, success: true, inserted: insertedCount, updated: updatedCount, duration });

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        
        await supabase.from('perfis_monitorados').update({
          status: 'erro',
          erro_ultima_coleta: errorMsg,
        }).eq('id', perfil.id);

        await log('erro', 'scraper', `Falha na coleta: @${perfil.username}`, { error: errorMsg }, duration);
        results.push({ username: perfil.username, success: false, error: errorMsg, duration });
      }
    }

    return new Response(JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro interno';
    await log('erro', 'scraper', 'Erro geral na execução', { error: errorMsg });
    return new Response(JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u00C0-\u024F]+/g);
  return matches || [];
}

function calculateEngagement(likes: number, comments: number, followers: number): number {
  if (followers === 0) return 0;
  return Number((((likes + comments) / followers) * 100).toFixed(2));
}
