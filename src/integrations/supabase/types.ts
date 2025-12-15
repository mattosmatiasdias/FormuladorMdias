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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      formulacao_itens: {
        Row: {
          custo_total: number | null
          custo_unitario: number | null
          formulacao_id: number | null
          id: number
          ingrediente_id: number | null
          ordem_mistura: number | null
          porcentagem: number
          quantidade_kg: number
        }
        Insert: {
          custo_total?: number | null
          custo_unitario?: number | null
          formulacao_id?: number | null
          id?: number
          ingrediente_id?: number | null
          ordem_mistura?: number | null
          porcentagem: number
          quantidade_kg: number
        }
        Update: {
          custo_total?: number | null
          custo_unitario?: number | null
          formulacao_id?: number | null
          id?: number
          ingrediente_id?: number | null
          ordem_mistura?: number | null
          porcentagem?: number
          quantidade_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "formulacao_itens_formulacao_id_fkey"
            columns: ["formulacao_id"]
            isOneToOne: false
            referencedRelation: "formulacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formulacao_itens_ingrediente_id_fkey"
            columns: ["ingrediente_id"]
            isOneToOne: false
            referencedRelation: "ingredientes"
            referencedColumns: ["id"]
          },
        ]
      }
      formulacoes: {
        Row: {
          atualizado_em: string | null
          ca_alvo: number | null
          codigo: string
          criado_em: string | null
          cultura: string | null
          custo_total: number | null
          descricao: string | null
          fase_crescimento: string | null
          id: number
          k_alvo: number | null
          n_alvo: number | null
          nome: string
          p_alvo: number | null
          peso_total: number | null
          publica: boolean | null
          regiao: string | null
          s_alvo: number | null
          solo_tipo: string | null
          status: string | null
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string | null
          ca_alvo?: number | null
          codigo: string
          criado_em?: string | null
          cultura?: string | null
          custo_total?: number | null
          descricao?: string | null
          fase_crescimento?: string | null
          id?: number
          k_alvo?: number | null
          n_alvo?: number | null
          nome: string
          p_alvo?: number | null
          peso_total?: number | null
          publica?: boolean | null
          regiao?: string | null
          s_alvo?: number | null
          solo_tipo?: string | null
          status?: string | null
          usuario_id: string
        }
        Update: {
          atualizado_em?: string | null
          ca_alvo?: number | null
          codigo?: string
          criado_em?: string | null
          cultura?: string | null
          custo_total?: number | null
          descricao?: string | null
          fase_crescimento?: string | null
          id?: number
          k_alvo?: number | null
          n_alvo?: number | null
          nome?: string
          p_alvo?: number | null
          peso_total?: number | null
          publica?: boolean | null
          regiao?: string | null
          s_alvo?: number | null
          solo_tipo?: string | null
          status?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      ingredientes: {
        Row: {
          atualizado_em: string | null
          b: number | null
          ca: number | null
          categoria: string | null
          codigo: string
          criado_em: string | null
          cu: number | null
          custo_por_ton: number
          densidade: number | null
          descricao: string | null
          disponivel: boolean | null
          fe: number | null
          id: number
          k: number | null
          mg: number | null
          mn: number | null
          mo: number | null
          n: number | null
          nome: string
          p: number | null
          s: number | null
          solubilidade: string | null
          tags: string[] | null
          usuario_id: string | null
          zn: number | null
        }
        Insert: {
          atualizado_em?: string | null
          b?: number | null
          ca?: number | null
          categoria?: string | null
          codigo: string
          criado_em?: string | null
          cu?: number | null
          custo_por_ton: number
          densidade?: number | null
          descricao?: string | null
          disponivel?: boolean | null
          fe?: number | null
          id?: number
          k?: number | null
          mg?: number | null
          mn?: number | null
          mo?: number | null
          n?: number | null
          nome: string
          p?: number | null
          s?: number | null
          solubilidade?: string | null
          tags?: string[] | null
          usuario_id?: string | null
          zn?: number | null
        }
        Update: {
          atualizado_em?: string | null
          b?: number | null
          ca?: number | null
          categoria?: string | null
          codigo?: string
          criado_em?: string | null
          cu?: number | null
          custo_por_ton?: number
          densidade?: number | null
          descricao?: string | null
          disponivel?: boolean | null
          fe?: number | null
          id?: number
          k?: number | null
          mg?: number | null
          mn?: number | null
          mo?: number | null
          n?: number | null
          nome?: string
          p?: number | null
          s?: number | null
          solubilidade?: string | null
          tags?: string[] | null
          usuario_id?: string | null
          zn?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          criado_em: string | null
          email: string
          empresa: string | null
          id: string
          nome: string
          ultimo_login: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          criado_em?: string | null
          email: string
          empresa?: string | null
          id: string
          nome: string
          ultimo_login?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          criado_em?: string | null
          email?: string
          empresa?: string | null
          id?: string
          nome?: string
          ultimo_login?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "usuario" | "consulta"
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
    Enums: {
      app_role: ["admin", "usuario", "consulta"],
    },
  },
} as const
