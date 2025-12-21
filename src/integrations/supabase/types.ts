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
      beta_pages: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          id: string
          launch_channels: string[] | null
          launch_date: string | null
          launch_stage: string | null
          max_signups: number | null
          page_type: string | null
          perks: string[] | null
          published_url: string | null
          referral_enabled: boolean | null
          reward_tiers: Json | null
          scarcity_type: string | null
          scarcity_value: number | null
          signup_goal: number | null
          status: string | null
          total_signups: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          launch_channels?: string[] | null
          launch_date?: string | null
          launch_stage?: string | null
          max_signups?: number | null
          page_type?: string | null
          perks?: string[] | null
          published_url?: string | null
          referral_enabled?: boolean | null
          reward_tiers?: Json | null
          scarcity_type?: string | null
          scarcity_value?: number | null
          signup_goal?: number | null
          status?: string | null
          total_signups?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          launch_channels?: string[] | null
          launch_date?: string | null
          launch_stage?: string | null
          max_signups?: number | null
          page_type?: string | null
          perks?: string[] | null
          published_url?: string | null
          referral_enabled?: boolean | null
          reward_tiers?: Json | null
          scarcity_type?: string | null
          scarcity_value?: number | null
          signup_goal?: number | null
          status?: string | null
          total_signups?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_pages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_signups: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          page_id: string
          position: number | null
          referral_code: string
          referral_count: number | null
          referred_by: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          page_id: string
          position?: number | null
          referral_code: string
          referral_count?: number | null
          referred_by?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          page_id?: string
          position?: number | null
          referral_code?: string
          referral_count?: number | null
          referred_by?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_signups_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "beta_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_briefs: {
        Row: {
          colors: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_storage_path: string | null
          logo_url: string | null
          name: string | null
          source_file_name: string | null
          typography: Json | null
          updated_at: string | null
          user_id: string
          voice_tone: Json | null
          website_url: string | null
        }
        Insert: {
          colors?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_storage_path?: string | null
          logo_url?: string | null
          name?: string | null
          source_file_name?: string | null
          typography?: Json | null
          updated_at?: string | null
          user_id: string
          voice_tone?: Json | null
          website_url?: string | null
        }
        Update: {
          colors?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_storage_path?: string | null
          logo_url?: string | null
          name?: string | null
          source_file_name?: string | null
          typography?: Json | null
          updated_at?: string | null
          user_id?: string
          voice_tone?: Json | null
          website_url?: string | null
        }
        Relationships: []
      }
      consultation_drafts: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          wizard_data: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          wizard_data?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          wizard_data?: Json | null
        }
        Relationships: []
      }
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
          ai_seo_data: Json | null
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
          ai_seo_data?: Json | null
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
          ai_seo_data?: Json | null
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
      demo_leads: {
        Row: {
          converted_to_user: boolean | null
          created_at: string | null
          email: string
          engagement_score: number | null
          extracted_intelligence: Json | null
          id: string
          session_id: string
          updated_at: string | null
        }
        Insert: {
          converted_to_user?: boolean | null
          created_at?: string | null
          email: string
          engagement_score?: number | null
          extracted_intelligence?: Json | null
          id?: string
          session_id: string
          updated_at?: string | null
        }
        Update: {
          converted_to_user?: boolean | null
          created_at?: string | null
          email?: string
          engagement_score?: number | null
          extracted_intelligence?: Json | null
          id?: string
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      demo_market_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          data: Json
          expires_at: string | null
          id: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          data: Json
          expires_at?: string | null
          id?: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          data?: Json
          expires_at?: string | null
          id?: string
        }
        Relationships: []
      }
      demo_sessions: {
        Row: {
          completed: boolean | null
          continued_to_consultation: boolean | null
          created_at: string | null
          extracted_intelligence: Json | null
          id: string
          ip_hash: string | null
          market_research: Json | null
          message_count: number | null
          messages: Json | null
          session_id: string
        }
        Insert: {
          completed?: boolean | null
          continued_to_consultation?: boolean | null
          created_at?: string | null
          extracted_intelligence?: Json | null
          id?: string
          ip_hash?: string | null
          market_research?: Json | null
          message_count?: number | null
          messages?: Json | null
          session_id: string
        }
        Update: {
          completed?: boolean | null
          continued_to_consultation?: boolean | null
          created_at?: string | null
          extracted_intelligence?: Json | null
          id?: string
          ip_hash?: string | null
          market_research?: Json | null
          message_count?: number | null
          messages?: Json | null
          session_id?: string
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
          ai_seo_breakdown: Json | null
          ai_seo_last_calculated: string | null
          ai_seo_score: number | null
          analytics_enabled: boolean | null
          consultation_data: Json | null
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
          strategy_brief: string | null
          styles: Json | null
          title: string
          updated_at: string
          user_id: string
          website_intelligence: Json | null
        }
        Insert: {
          ai_seo_breakdown?: Json | null
          ai_seo_last_calculated?: string | null
          ai_seo_score?: number | null
          analytics_enabled?: boolean | null
          consultation_data?: Json | null
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
          strategy_brief?: string | null
          styles?: Json | null
          title: string
          updated_at?: string
          user_id: string
          website_intelligence?: Json | null
        }
        Update: {
          ai_seo_breakdown?: Json | null
          ai_seo_last_calculated?: string | null
          ai_seo_score?: number | null
          analytics_enabled?: boolean | null
          consultation_data?: Json | null
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
          strategy_brief?: string | null
          styles?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          website_intelligence?: Json | null
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
      usage_log: {
        Row: {
          action_cost: number
          action_type: Database["public"]["Enums"]["ai_action_type"]
          created_at: string
          description: string | null
          id: string
          page_id: string | null
          section_type: string | null
          user_id: string
        }
        Insert: {
          action_cost: number
          action_type: Database["public"]["Enums"]["ai_action_type"]
          created_at?: string
          description?: string | null
          id?: string
          page_id?: string | null
          section_type?: string | null
          user_id: string
        }
        Update: {
          action_cost?: number
          action_type?: Database["public"]["Enums"]["ai_action_type"]
          created_at?: string
          description?: string | null
          id?: string
          page_id?: string | null
          section_type?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_usage: {
        Row: {
          actions_purchased: number
          ai_actions_limit: number | null
          ai_actions_rollover: number
          ai_actions_used: number
          billing_period_end: string | null
          billing_period_start: string
          created_at: string
          grace_actions_given: boolean
          id: string
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions_purchased?: number
          ai_actions_limit?: number | null
          ai_actions_rollover?: number
          ai_actions_used?: number
          billing_period_end?: string | null
          billing_period_start?: string
          created_at?: string
          grace_actions_given?: boolean
          id?: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions_purchased?: number
          ai_actions_limit?: number | null
          ai_actions_rollover?: number
          ai_actions_used?: number
          billing_period_end?: string | null
          billing_period_start?: string
          created_at?: string
          grace_actions_given?: boolean
          id?: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
      grant_grace_actions: { Args: { p_user_id: string }; Returns: Json }
      reset_api_calls: { Args: never; Returns: undefined }
      reset_monthly_usage: { Args: never; Returns: undefined }
      track_ai_action:
        | {
            Args: {
              p_action_cost: number
              p_action_type: Database["public"]["Enums"]["ai_action_type"]
              p_page_id?: string
              p_section_type?: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_action_cost: number
              p_action_type: Database["public"]["Enums"]["ai_action_type"]
              p_description?: string
              p_page_id?: string
              p_section_type?: string
              p_user_id: string
            }
            Returns: Json
          }
    }
    Enums: {
      ai_action_type:
        | "page_generation"
        | "section_regeneration"
        | "ai_improvement"
        | "intelligence_refresh"
        | "style_change"
        | "research"
        | "consultation"
        | "generation"
        | "revision"
        | "calculator"
        | "copy_improve"
      plan_tier: "starter" | "pro" | "agency"
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
      ai_action_type: [
        "page_generation",
        "section_regeneration",
        "ai_improvement",
        "intelligence_refresh",
        "style_change",
        "research",
        "consultation",
        "generation",
        "revision",
        "calculator",
        "copy_improve",
      ],
      plan_tier: ["starter", "pro", "agency"],
    },
  },
} as const
