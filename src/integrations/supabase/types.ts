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
      consultation_sessions: {
        Row: {
          approved_sections: Json | null
          consultation_answers: Json | null
          created_at: string | null
          current_step: string | null
          email_reminder_sent: boolean | null
          id: string
          last_active: string | null
          session_token: string
          status: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          approved_sections?: Json | null
          consultation_answers?: Json | null
          created_at?: string | null
          current_step?: string | null
          email_reminder_sent?: boolean | null
          id?: string
          last_active?: string | null
          session_token: string
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          approved_sections?: Json | null
          consultation_answers?: Json | null
          created_at?: string | null
          current_step?: string | null
          email_reminder_sent?: boolean | null
          id?: string
          last_active?: string | null
          session_token?: string
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          calculator_config: Json | null
          challenge: string | null
          created_at: string
          goal: string | null
          id: string
          industry: string | null
          offer: string | null
          service_type: string | null
          status: string
          target_audience: string | null
          unique_value: string | null
          updated_at: string
          user_id: string
          wants_calculator: boolean | null
        }
        Insert: {
          calculator_config?: Json | null
          challenge?: string | null
          created_at?: string
          goal?: string | null
          id?: string
          industry?: string | null
          offer?: string | null
          service_type?: string | null
          status?: string
          target_audience?: string | null
          unique_value?: string | null
          updated_at?: string
          user_id: string
          wants_calculator?: boolean | null
        }
        Update: {
          calculator_config?: Json | null
          challenge?: string | null
          created_at?: string
          goal?: string | null
          id?: string
          industry?: string | null
          offer?: string | null
          service_type?: string | null
          status?: string
          target_audience?: string | null
          unique_value?: string | null
          updated_at?: string
          user_id?: string
          wants_calculator?: boolean | null
        }
        Relationships: []
      }
      generation_logs: {
        Row: {
          confidence_score: number | null
          consultation_id: string | null
          created_at: string
          generated_content: Json
          generation_type: string
          id: string
          input_data: Json
          intelligence_used: Json | null
          persona_intelligence_id: string | null
          regeneration_count: number | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          consultation_id?: string | null
          created_at?: string
          generated_content?: Json
          generation_type: string
          id?: string
          input_data?: Json
          intelligence_used?: Json | null
          persona_intelligence_id?: string | null
          regeneration_count?: number | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          consultation_id?: string | null
          created_at?: string
          generated_content?: Json
          generation_type?: string
          id?: string
          input_data?: Json
          intelligence_used?: Json | null
          persona_intelligence_id?: string | null
          regeneration_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_logs_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_logs_persona_intelligence_id_fkey"
            columns: ["persona_intelligence_id"]
            isOneToOne: false
            referencedRelation: "persona_intelligence"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          analytics_enabled: boolean | null
          consultation_id: string | null
          created_at: string
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          published_url: string | null
          sections: Json
          slug: string
          status: string
          styles: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_enabled?: boolean | null
          consultation_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          published_url?: string | null
          sections?: Json
          slug: string
          status?: string
          styles?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_enabled?: boolean | null
          consultation_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          published_url?: string | null
          sections?: Json
          slug?: string
          status?: string
          styles?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_intelligence: {
        Row: {
          completed_at: string | null
          confidence_score: number | null
          consultation_id: string | null
          created_at: string
          id: string
          industry: string | null
          location: string | null
          market_research: Json | null
          research_sources: string[] | null
          research_status: string | null
          service_type: string | null
          synthesized_persona: Json | null
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confidence_score?: number | null
          consultation_id?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          market_research?: Json | null
          research_sources?: string[] | null
          research_status?: string | null
          service_type?: string | null
          synthesized_persona?: Json | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confidence_score?: number | null
          consultation_id?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          market_research?: Json | null
          research_sources?: string[] | null
          research_status?: string | null
          service_type?: string | null
          synthesized_persona?: Json | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_intelligence_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plans: {
        Row: {
          api_calls_limit: number
          api_calls_remaining: number
          created_at: string
          id: string
          plan_name: string
          reset_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_calls_limit?: number
          api_calls_remaining?: number
          created_at?: string
          id?: string
          plan_name?: string
          reset_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_calls_limit?: number
          api_calls_remaining?: number
          created_at?: string
          id?: string
          plan_name?: string
          reset_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_api_calls: { Args: never; Returns: undefined }
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
