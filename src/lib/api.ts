import { supabase } from "@/integrations/supabase/client";

// Types
export interface PerfilMonitorado {
  id: string;
  username: string;
  plataforma: string;
  ativo: boolean;
  intervalo_minutos: number;
  ultima_coleta: string | null;
  total_coletas: number;
  status: string;
  erro_ultima_coleta: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coleta {
  id: string;
  nome_perfil_analisado: string;
  data_coleta: string;
  perfil_nome: string | null;
  perfil_username: string | null;
  perfil_seguidores: number | null;
  perfil_seguindo: number | null;
  perfil_posts_total: number | null;
  post_id: string | null;
  post_link: string | null;
  post_legenda: string | null;
  post_tipo: string | null;
  metricas_curtidas: number;
  metricas_comentarios: number;
  metricas_compartilhamentos: number;
  metricas_salvamentos: number;
  metricas_video_views: number;
  calc_taxa_engajamento: number | null;
  hashtags_lista: string[] | null;
  created_at: string;
}

export interface SystemLog {
  id: string;
  tipo: string;
  modulo: string;
  mensagem: string;
  detalhes: any;
  duracao_ms: number | null;
  created_at: string;
}

export interface Configuracao {
  id: string;
  chave: string;
  valor: string | null;
  descricao: string | null;
  updated_at: string;
}

// API Functions
export const api = {
  // Perfis
  async getPerfis(): Promise<PerfilMonitorado[]> {
    const { data, error } = await supabase.from('perfis_monitorados').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as PerfilMonitorado[];
  },

  async addPerfil(username: string, plataforma = 'instagram', intervalo_minutos = 60): Promise<PerfilMonitorado> {
    const { data, error } = await supabase.from('perfis_monitorados')
      .insert({ username: username.replace('@', ''), plataforma, intervalo_minutos })
      .select().single();
    if (error) throw error;
    return data as unknown as PerfilMonitorado;
  },

  async updatePerfil(id: string, updates: Partial<PerfilMonitorado>): Promise<void> {
    const { error } = await supabase.from('perfis_monitorados').update(updates as any).eq('id', id);
    if (error) throw error;
  },

  async deletePerfil(id: string): Promise<void> {
    const { error } = await supabase.from('perfis_monitorados').delete().eq('id', id);
    if (error) throw error;
  },

  // Coletas
  async getColetas(limit = 100): Promise<Coleta[]> {
    const { data, error } = await supabase.from('coletas').select('*').order('data_coleta', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as unknown as Coleta[];
  },

  async getColetasByPerfil(username: string): Promise<Coleta[]> {
    const { data, error } = await supabase.from('coletas').select('*')
      .eq('nome_perfil_analisado', username).order('data_coleta', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as Coleta[];
  },

  // Logs
  async getLogs(limit = 200): Promise<SystemLog[]> {
    const { data, error } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as unknown as SystemLog[];
  },

  // Configurações
  async getConfiguracoes(): Promise<Configuracao[]> {
    const { data, error } = await supabase.from('configuracoes').select('*').order('chave');
    if (error) throw error;
    return (data || []) as unknown as Configuracao[];
  },

  async updateConfiguracao(chave: string, valor: string): Promise<void> {
    const { data: existing } = await supabase.from('configuracoes').select('id').eq('chave', chave).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('configuracoes').update({ valor } as any).eq('chave', chave);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('configuracoes').insert({ chave, valor } as any);
      if (error) throw error;
    }
  },

  // Executar coleta
  async executarColeta(options?: { username?: string, date_start?: string, date_end?: string, max_posts?: number }): Promise<any> {
    const { data: apiKeyConfig } = await supabase.from('configuracoes').select('valor').eq('chave', 'apify_api_key').maybeSingle();

    const { data, error } = await supabase.functions.invoke('executar-coleta', {
      body: {
        username: options?.username,
        api_key: (apiKeyConfig as any)?.valor,
        date_start: options?.date_start,
        date_end: options?.date_end,
        max_posts: options?.max_posts
      },
    });
    if (error) throw error;
    return data;
  },

  // Dashboard stats
  async getStats() {
    const [perfisRes, coletasRes, logsRes] = await Promise.all([
      supabase.from('perfis_monitorados').select('*'),
      supabase.from('coletas').select('id, data_coleta, calc_taxa_engajamento, metricas_curtidas, metricas_comentarios', { count: 'exact' }),
      supabase.from('system_logs').select('tipo', { count: 'exact' }).eq('tipo', 'erro'),
    ]);

    const perfis = (perfisRes.data || []) as unknown as PerfilMonitorado[];
    const totalColetas = coletasRes.count || 0;
    const totalErros = logsRes.count || 0;
    const perfisAtivos = perfis.filter(p => p.ativo).length;
    const ultimaColeta = perfis.reduce((latest, p) => {
      if (!p.ultima_coleta) return latest;
      return !latest || new Date(p.ultima_coleta) > new Date(latest) ? p.ultima_coleta : latest;
    }, null as string | null);

    return { totalPerfis: perfis.length, perfisAtivos, totalColetas, totalErros, ultimaColeta };
  },
};
