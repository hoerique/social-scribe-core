export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      coletas: {
        Row: {
          calc_taxa_engajamento: number | null
          comentarios_bairros_cifrados: Json | null
          comentarios_info: Json | null
          created_at: string
          curtidas_info: Json | null
          data_coleta: string
          hashtags_info: Json | null
          hashtags_lista: string[] | null
          hashtags_qtd: number | null
          id: string
          localizacao_bairro: string | null
          localizacao_cidade: string | null
          localizacao_estado: string | null
          localizacao_nome: string | null
          localizacao_pais: string | null
          metricas_comentarios: number | null
          metricas_compartilhamentos: number | null
          metricas_curtidas: number | null
          metricas_salvamentos: number | null
          metricas_video_duracao: number | null
          metricas_video_views: number | null
          nome_perfil_analisado: string
          perfil_biografia: string | null
          perfil_categoria: string | null
          perfil_foto_url: string | null
          perfil_nome: string | null
          perfil_posts_total: number | null
          perfil_privado: boolean | null
          perfil_seguidores: number | null
          perfil_seguindo: number | null
          perfil_url_bio: string | null
          perfil_username: string | null
          post_data: string | null
          post_id: string | null
          post_legenda: string | null
          post_link: string | null
          post_midias_info: Json | null
          post_qtd_midias: number | null
          post_tipo: string | null
        }
        Insert: {
          calc_taxa_engajamento?: number | null
          comentarios_bairros_cifrados?: Json | null
          comentarios_info?: Json | null
          created_at?: string
          curtidas_info?: Json | null
          data_coleta?: string
          hashtags_info?: Json | null
          hashtags_lista?: string[] | null
          hashtags_qtd?: number | null
          id?: string
          localizacao_bairro?: string | null
          localizacao_cidade?: string | null
          localizacao_estado?: string | null
          localizacao_nome?: string | null
          localizacao_pais?: string | null
          metricas_comentarios?: number | null
          metricas_compartilhamentos?: number | null
          metricas_curtidas?: number | null
          metricas_salvamentos?: number | null
          metricas_video_duracao?: number | null
          metricas_video_views?: number | null
          nome_perfil_analisado: string
          perfil_biografia?: string | null
          perfil_categoria?: string | null
          perfil_foto_url?: string | null
          perfil_nome?: string | null
          perfil_posts_total?: number | null
          perfil_privado?: boolean | null
          perfil_seguidores?: number | null
          perfil_seguindo?: number | null
          perfil_url_bio?: string | null
          perfil_username?: string | null
          post_data?: string | null
          post_id?: string | null
          post_legenda?: string | null
          post_link?: string | null
          post_midias_info?: Json | null
          post_qtd_midias?: number | null
          post_tipo?: string | null
        }
        Update: {
          calc_taxa_engajamento?: number | null
          comentarios_bairros_cifrados?: Json | null
          comentarios_info?: Json | null
          created_at?: string
          curtidas_info?: Json | null
          data_coleta?: string
          hashtags_info?: Json | null
          hashtags_lista?: string[] | null
          hashtags_qtd?: number | null
          id?: string
          localizacao_bairro?: string | null
          localizacao_cidade?: string | null
          localizacao_estado?: string | null
          localizacao_nome?: string | null
          localizacao_pais?: string | null
          metricas_comentarios?: number | null
          metricas_compartilhamentos?: number | null
          metricas_curtidas?: number | null
          metricas_salvamentos?: number | null
          metricas_video_duracao?: number | null
          metricas_video_views?: number | null
          nome_perfil_analisado?: string
          perfil_biografia?: string | null
          perfil_categoria?: string | null
          perfil_foto_url?: string | null
          perfil_nome?: string | null
          perfil_posts_total?: number | null
          perfil_privado?: boolean | null
          perfil_seguidores?: number | null
          perfil_seguindo?: number | null
          perfil_url_bio?: string | null
          perfil_username?: string | null
          post_data?: string | null
          post_id?: string | null
          post_legenda?: string | null
          post_link?: string | null
          post_midias_info?: Json | null
          post_qtd_midias?: number | null
          post_tipo?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      perfis_monitorados: {
        Row: {
          ativo: boolean
          created_at: string
          erro_ultima_coleta: string | null
          id: string
          intervalo_minutos: number
          plataforma: string
          status: string | null
          total_coletas: number | null
          ultima_coleta: string | null
          updated_at: string
          username: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          erro_ultima_coleta?: string | null
          id?: string
          intervalo_minutos?: number
          plataforma?: string
          status?: string | null
          total_coletas?: number | null
          ultima_coleta?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          erro_ultima_coleta?: string | null
          id?: string
          intervalo_minutos?: number
          plataforma?: string
          status?: string | null
          total_coletas?: number | null
          ultima_coleta?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          detalhes: Json | null
          duracao_ms: number | null
          id: string
          mensagem: string
          modulo: string
          tipo: string
        }
        Insert: {
          created_at?: string
          detalhes?: Json | null
          duracao_ms?: number | null
          id?: string
          mensagem: string
          modulo: string
          tipo?: string
        }
        Update: {
          created_at?: string
          detalhes?: Json | null
          duracao_ms?: number | null
          id?: string
          mensagem?: string
          modulo?: string
          tipo?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
