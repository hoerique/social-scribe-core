
-- Tabela principal de coletas (dados raspados)
CREATE TABLE public.coletas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_perfil_analisado TEXT NOT NULL,
  data_coleta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  perfil_nome TEXT,
  perfil_username TEXT,
  perfil_biografia TEXT,
  perfil_seguidores INTEGER,
  perfil_seguindo INTEGER,
  perfil_posts_total INTEGER,
  perfil_privado BOOLEAN DEFAULT false,
  perfil_url_bio TEXT,
  perfil_categoria TEXT,
  perfil_foto_url TEXT,
  post_id TEXT,
  post_link TEXT,
  post_data TIMESTAMP WITH TIME ZONE,
  post_legenda TEXT,
  post_tipo TEXT,
  post_qtd_midias INTEGER DEFAULT 0,
  post_midias_info JSONB,
  metricas_curtidas INTEGER DEFAULT 0,
  metricas_comentarios INTEGER DEFAULT 0,
  metricas_compartilhamentos INTEGER DEFAULT 0,
  metricas_salvamentos INTEGER DEFAULT 0,
  metricas_video_views INTEGER DEFAULT 0,
  metricas_video_duracao NUMERIC,
  comentarios_info JSONB,
  comentarios_bairros_cifrados JSONB,
  curtidas_info JSONB,
  hashtags_lista TEXT[],
  hashtags_qtd INTEGER DEFAULT 0,
  hashtags_info JSONB,
  localizacao_nome TEXT,
  localizacao_bairro TEXT,
  localizacao_cidade TEXT,
  localizacao_estado TEXT,
  localizacao_pais TEXT,
  calc_taxa_engajamento NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_coletas_perfil ON public.coletas (nome_perfil_analisado);
CREATE INDEX idx_coletas_data ON public.coletas (data_coleta DESC);
CREATE INDEX idx_coletas_post_id ON public.coletas (post_id);
CREATE UNIQUE INDEX idx_coletas_unique_post ON public.coletas (nome_perfil_analisado, post_id) WHERE post_id IS NOT NULL;

-- Tabela de perfis monitorados
CREATE TABLE public.perfis_monitorados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  plataforma TEXT NOT NULL DEFAULT 'instagram',
  ativo BOOLEAN NOT NULL DEFAULT true,
  intervalo_minutos INTEGER NOT NULL DEFAULT 60,
  ultima_coleta TIMESTAMP WITH TIME ZONE,
  total_coletas INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pendente',
  erro_ultima_coleta TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de logs do sistema
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL DEFAULT 'info',
  modulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  detalhes JSONB,
  duracao_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_tipo ON public.system_logs (tipo);
CREATE INDEX idx_logs_created ON public.system_logs (created_at DESC);

-- Tabela de configurações
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.configuracoes (chave, valor, descricao) VALUES
  ('api_provider', 'apify', 'Provedor de API externa'),
  ('scraping_interval', '60', 'Intervalo padrão de scraping em minutos'),
  ('max_retries', '3', 'Número máximo de tentativas'),
  ('concurrent_jobs', '2', 'Número de jobs concorrentes');

-- RLS: tabelas públicas (sem auth necessário para este sistema de monitoramento)
ALTER TABLE public.coletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis_monitorados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para todas as operações (sistema interno)
CREATE POLICY "Allow all on coletas" ON public.coletas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on perfis_monitorados" ON public.perfis_monitorados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on system_logs" ON public.system_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on configuracoes" ON public.configuracoes FOR ALL USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON public.perfis_monitorados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime para monitoramento
ALTER PUBLICATION supabase_realtime ADD TABLE public.coletas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.perfis_monitorados;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
