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
      admin_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
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
      brand_scene_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          id: string
          industry: string
          logo_hash: string
          scenes: Json
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          id?: string
          industry: string
          logo_hash: string
          scenes: Json
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          id?: string
          industry?: string
          logo_hash?: string
          scenes?: Json
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_scene_generations: {
        Row: {
          cache_key: string | null
          consultation_id: string | null
          created_at: string | null
          from_cache: boolean | null
          id: string
          scenes_count: number | null
          user_id: string | null
        }
        Insert: {
          cache_key?: string | null
          consultation_id?: string | null
          created_at?: string | null
          from_cache?: boolean | null
          id?: string
          scenes_count?: number | null
          user_id?: string | null
        }
        Update: {
          cache_key?: string | null
          consultation_id?: string | null
          created_at?: string | null
          from_cache?: boolean | null
          id?: string
          scenes_count?: number | null
          user_id?: string | null
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
          active_brief_version: number | null
          ai_seo_data: Json | null
          audience_goals: string[] | null
          audience_pain_points: string[] | null
          authority_markers: string[] | null
          brief_versions: Json | null
          business_name: string | null
          calculator_config: Json | null
          card_notes: Json | null
          case_study_highlight: string | null
          challenge: string | null
          client_count: string | null
          communication_style: Json | null
          competitor_differentiator: string | null
          consultation_status: string | null
          created_at: string
          credentials: string | null
          extracted_intelligence: Json | null
          flow_history: Json | null
          flow_state: string | null
          goal: string | null
          guarantee_offer: string | null
          guest_session_id: string | null
          id: string
          industry: string | null
          key_benefits: string[] | null
          last_huddle_at: string | null
          last_huddle_type: string | null
          offer: string | null
          primary_cta: string | null
          readiness_score: number | null
          risk_reversals: string[] | null
          secondary_cta: string | null
          service_type: string | null
          status: string
          strategy_brief: Json | null
          target_audience: string | null
          unique_value: string | null
          updated_at: string
          urgency_angle: string | null
          user_id: string | null
          wants_calculator: boolean | null
          website_url: string | null
        }
        Insert: {
          active_brief_version?: number | null
          ai_seo_data?: Json | null
          audience_goals?: string[] | null
          audience_pain_points?: string[] | null
          authority_markers?: string[] | null
          brief_versions?: Json | null
          business_name?: string | null
          calculator_config?: Json | null
          card_notes?: Json | null
          case_study_highlight?: string | null
          challenge?: string | null
          client_count?: string | null
          communication_style?: Json | null
          competitor_differentiator?: string | null
          consultation_status?: string | null
          created_at?: string
          credentials?: string | null
          extracted_intelligence?: Json | null
          flow_history?: Json | null
          flow_state?: string | null
          goal?: string | null
          guarantee_offer?: string | null
          guest_session_id?: string | null
          id?: string
          industry?: string | null
          key_benefits?: string[] | null
          last_huddle_at?: string | null
          last_huddle_type?: string | null
          offer?: string | null
          primary_cta?: string | null
          readiness_score?: number | null
          risk_reversals?: string[] | null
          secondary_cta?: string | null
          service_type?: string | null
          status?: string
          strategy_brief?: Json | null
          target_audience?: string | null
          unique_value?: string | null
          updated_at?: string
          urgency_angle?: string | null
          user_id?: string | null
          wants_calculator?: boolean | null
          website_url?: string | null
        }
        Update: {
          active_brief_version?: number | null
          ai_seo_data?: Json | null
          audience_goals?: string[] | null
          audience_pain_points?: string[] | null
          authority_markers?: string[] | null
          brief_versions?: Json | null
          business_name?: string | null
          calculator_config?: Json | null
          card_notes?: Json | null
          case_study_highlight?: string | null
          challenge?: string | null
          client_count?: string | null
          communication_style?: Json | null
          competitor_differentiator?: string | null
          consultation_status?: string | null
          created_at?: string
          credentials?: string | null
          extracted_intelligence?: Json | null
          flow_history?: Json | null
          flow_state?: string | null
          goal?: string | null
          guarantee_offer?: string | null
          guest_session_id?: string | null
          id?: string
          industry?: string | null
          key_benefits?: string[] | null
          last_huddle_at?: string | null
          last_huddle_type?: string | null
          offer?: string | null
          primary_cta?: string | null
          readiness_score?: number | null
          risk_reversals?: string[] | null
          secondary_cta?: string | null
          service_type?: string | null
          status?: string
          strategy_brief?: Json | null
          target_audience?: string | null
          unique_value?: string | null
          updated_at?: string
          urgency_angle?: string | null
          user_id?: string | null
          wants_calculator?: boolean | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
        ]
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
          brand_assets: Json | null
          brand_intake_at: string | null
          brand_intake_completed: boolean | null
          brief_viewed_at: string | null
          claimed_at: string | null
          claimed_by: string | null
          completed: boolean | null
          continued_to_consultation: boolean | null
          created_at: string | null
          extracted_intelligence: Json | null
          id: string
          ip_hash: string | null
          market_research: Json | null
          message_count: number | null
          messages: Json | null
          readiness: number | null
          session_id: string
        }
        Insert: {
          brand_assets?: Json | null
          brand_intake_at?: string | null
          brand_intake_completed?: boolean | null
          brief_viewed_at?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          completed?: boolean | null
          continued_to_consultation?: boolean | null
          created_at?: string | null
          extracted_intelligence?: Json | null
          id?: string
          ip_hash?: string | null
          market_research?: Json | null
          message_count?: number | null
          messages?: Json | null
          readiness?: number | null
          session_id: string
        }
        Update: {
          brand_assets?: Json | null
          brand_intake_at?: string | null
          brand_intake_completed?: boolean | null
          brief_viewed_at?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          completed?: boolean | null
          continued_to_consultation?: boolean | null
          created_at?: string | null
          extracted_intelligence?: Json | null
          id?: string
          ip_hash?: string | null
          market_research?: Json | null
          message_count?: number | null
          messages?: Json | null
          readiness?: number | null
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
      guest_sessions: {
        Row: {
          consultation_data: Json | null
          converted_at: string | null
          converted_to_user_id: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          generated_brief_id: string | null
          generated_page_id: string | null
          id: string
          intelligence_state: Json | null
          session_token: string
        }
        Insert: {
          consultation_data?: Json | null
          converted_at?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          generated_brief_id?: string | null
          generated_page_id?: string | null
          id?: string
          intelligence_state?: Json | null
          session_token: string
        }
        Update: {
          consultation_data?: Json | null
          converted_at?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          generated_brief_id?: string | null
          generated_page_id?: string | null
          id?: string
          intelligence_state?: Json | null
          session_token?: string
        }
        Relationships: []
      }
      hero_image_cache: {
        Row: {
          cache_key: string
          created_at: string
          id: string
          images: string[]
          updated_at: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          id?: string
          images?: string[]
          updated_at?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          id?: string
          images?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          display_order: number | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          display_order?: number | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          display_order?: number | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
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
          hero_thumbnail_url: string | null
          id: string
          industry: string | null
          is_current_version: boolean | null
          is_published: boolean | null
          last_change_summary: string | null
          last_viewed_at: string | null
          meta_description: string | null
          meta_title: string | null
          parent_page_id: string | null
          published_at: string | null
          published_url: string | null
          quick_pivot_enabled: boolean | null
          sections: Json
          session_id: string | null
          slug: string
          status: string
          strategy_brief: string | null
          styles: Json | null
          title: string
          updated_at: string
          user_id: string
          version_number: number | null
          view_count: number | null
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
          hero_thumbnail_url?: string | null
          id?: string
          industry?: string | null
          is_current_version?: boolean | null
          is_published?: boolean | null
          last_change_summary?: string | null
          last_viewed_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          parent_page_id?: string | null
          published_at?: string | null
          published_url?: string | null
          quick_pivot_enabled?: boolean | null
          sections?: Json
          session_id?: string | null
          slug: string
          status?: string
          strategy_brief?: string | null
          styles?: Json | null
          title: string
          updated_at?: string
          user_id: string
          version_number?: number | null
          view_count?: number | null
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
          hero_thumbnail_url?: string | null
          id?: string
          industry?: string | null
          is_current_version?: boolean | null
          is_published?: boolean | null
          last_change_summary?: string | null
          last_viewed_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          parent_page_id?: string | null
          published_at?: string | null
          published_url?: string | null
          quick_pivot_enabled?: boolean | null
          sections?: Json
          session_id?: string | null
          slug?: string
          status?: string
          strategy_brief?: string | null
          styles?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          version_number?: number | null
          view_count?: number | null
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
          {
            foreignKeyName: "landing_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          consultation_snapshot: Json | null
          converted_at: string | null
          converted_to_user_id: string | null
          created_at: string | null
          email: string
          guest_session_id: string | null
          id: string
          source: string | null
        }
        Insert: {
          consultation_snapshot?: Json | null
          converted_at?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          email: string
          guest_session_id?: string | null
          id?: string
          source?: string | null
        }
        Update: {
          consultation_snapshot?: Json | null
          converted_at?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          email?: string
          guest_session_id?: string | null
          id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          email_notifications: boolean | null
          full_name: string | null
          id: string
          job_title: string | null
          marketing_emails: boolean | null
          phone_number: string | null
          preferred_mode: string | null
          prospect_view_alerts: boolean | null
          signature_email: string | null
          signature_enabled: boolean | null
          signature_headshot_url: string | null
          signature_html: string | null
          signature_name: string | null
          signature_phone: string | null
          signature_title: string | null
          signature_type: string | null
          signature_website: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
          weekly_summary_emails: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          job_title?: string | null
          marketing_emails?: boolean | null
          phone_number?: string | null
          preferred_mode?: string | null
          prospect_view_alerts?: boolean | null
          signature_email?: string | null
          signature_enabled?: boolean | null
          signature_headshot_url?: string | null
          signature_html?: string | null
          signature_name?: string | null
          signature_phone?: string | null
          signature_title?: string | null
          signature_type?: string | null
          signature_website?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          weekly_summary_emails?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          marketing_emails?: boolean | null
          phone_number?: string | null
          preferred_mode?: string | null
          prospect_view_alerts?: boolean | null
          signature_email?: string | null
          signature_enabled?: boolean | null
          signature_headshot_url?: string | null
          signature_html?: string | null
          signature_name?: string | null
          signature_phone?: string | null
          signature_title?: string | null
          signature_type?: string | null
          signature_website?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          weekly_summary_emails?: boolean | null
        }
        Relationships: []
      }
      prospect_page_views: {
        Row: {
          city: string | null
          country: string | null
          id: string
          ip_address: unknown
          prospect_page_id: string
          referrer: string | null
          user_agent: string | null
          viewed_at: string | null
          visitor_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown
          prospect_page_id: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          visitor_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown
          prospect_page_id?: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_page_views_prospect_page_id_fkey"
            columns: ["prospect_page_id"]
            isOneToOne: false
            referencedRelation: "prospect_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_pages: {
        Row: {
          competitive_situation: string | null
          created_at: string | null
          custom_instructions: string | null
          deal_stage: string
          expires_at: string | null
          id: string
          known_pain_points: string[] | null
          last_viewed_at: string | null
          personalized_brief: Json | null
          personalized_headline: string | null
          personalized_sections: Json | null
          personalized_subheadline: string | null
          prospect_company: string
          prospect_company_size: string | null
          prospect_email: string | null
          prospect_industry: string | null
          prospect_name: string
          prospect_title: string | null
          published_at: string | null
          source_demo_session_id: string | null
          source_landing_page_id: string | null
          specific_use_case: string | null
          status: string | null
          unique_slug: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          competitive_situation?: string | null
          created_at?: string | null
          custom_instructions?: string | null
          deal_stage?: string
          expires_at?: string | null
          id?: string
          known_pain_points?: string[] | null
          last_viewed_at?: string | null
          personalized_brief?: Json | null
          personalized_headline?: string | null
          personalized_sections?: Json | null
          personalized_subheadline?: string | null
          prospect_company: string
          prospect_company_size?: string | null
          prospect_email?: string | null
          prospect_industry?: string | null
          prospect_name: string
          prospect_title?: string | null
          published_at?: string | null
          source_demo_session_id?: string | null
          source_landing_page_id?: string | null
          specific_use_case?: string | null
          status?: string | null
          unique_slug: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          competitive_situation?: string | null
          created_at?: string | null
          custom_instructions?: string | null
          deal_stage?: string
          expires_at?: string | null
          id?: string
          known_pain_points?: string[] | null
          last_viewed_at?: string | null
          personalized_brief?: Json | null
          personalized_headline?: string | null
          personalized_sections?: Json | null
          personalized_subheadline?: string | null
          prospect_company?: string
          prospect_company_size?: string | null
          prospect_email?: string | null
          prospect_industry?: string | null
          prospect_name?: string
          prospect_title?: string | null
          published_at?: string | null
          source_demo_session_id?: string | null
          source_landing_page_id?: string | null
          specific_use_case?: string | null
          status?: string | null
          unique_slug?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_pages_source_demo_session_id_fkey"
            columns: ["source_demo_session_id"]
            isOneToOne: false
            referencedRelation: "demo_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_pages_source_landing_page_id_fkey"
            columns: ["source_landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_views: {
        Row: {
          device_type: string | null
          id: string
          prospect_id: string
          referrer_source: string | null
          scroll_depth: number | null
          time_on_page: number | null
          viewed_at: string | null
        }
        Insert: {
          device_type?: string | null
          id?: string
          prospect_id: string
          referrer_source?: string | null
          scroll_depth?: number | null
          time_on_page?: number | null
          viewed_at?: string | null
        }
        Update: {
          device_type?: string | null
          id?: string
          prospect_id?: string
          referrer_source?: string | null
          scroll_depth?: number | null
          time_on_page?: number | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_views_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          base_page_id: string | null
          company: string | null
          context_raw: string | null
          context_summary: string | null
          created_at: string | null
          email: string | null
          email_body: string | null
          email_sent_at: string | null
          email_status: string | null
          email_subject: string | null
          engagement_score: number | null
          first_name: string
          first_viewed_at: string | null
          full_name: string | null
          id: string
          industry: string | null
          job_title: string | null
          last_name: string | null
          last_viewed_at: string | null
          meeting_context: string | null
          personalized_cta_text: string | null
          personalized_headline: string | null
          personalized_subhead: string | null
          slug: string
          status: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          base_page_id?: string | null
          company?: string | null
          context_raw?: string | null
          context_summary?: string | null
          created_at?: string | null
          email?: string | null
          email_body?: string | null
          email_sent_at?: string | null
          email_status?: string | null
          email_subject?: string | null
          engagement_score?: number | null
          first_name: string
          first_viewed_at?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_name?: string | null
          last_viewed_at?: string | null
          meeting_context?: string | null
          personalized_cta_text?: string | null
          personalized_headline?: string | null
          personalized_subhead?: string | null
          slug: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          base_page_id?: string | null
          company?: string | null
          context_raw?: string | null
          context_summary?: string | null
          created_at?: string | null
          email?: string | null
          email_body?: string | null
          email_sent_at?: string | null
          email_status?: string | null
          email_subject?: string | null
          engagement_score?: number | null
          first_name?: string
          first_viewed_at?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_name?: string | null
          last_viewed_at?: string | null
          meeting_context?: string | null
          personalized_cta_text?: string | null
          personalized_headline?: string | null
          personalized_subhead?: string | null
          slug?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_base_page_id_fkey"
            columns: ["base_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      testimonial_requests: {
        Row: {
          clicked_at: string | null
          consultation_id: string | null
          created_at: string | null
          email_body: string
          email_subject: string
          follow_up_scheduled_at: string | null
          follow_up_sent_at: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          request_page_url: string
          resend_id: string | null
          responded_at: string | null
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          consultation_id?: string | null
          created_at?: string | null
          email_body: string
          email_subject: string
          follow_up_scheduled_at?: string | null
          follow_up_sent_at?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          request_page_url: string
          resend_id?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          consultation_id?: string | null
          created_at?: string | null
          email_body?: string
          email_subject?: string
          follow_up_scheduled_at?: string | null
          follow_up_sent_at?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          request_page_url?: string
          resend_id?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_requests_consultation_id_fkey"
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
          subscription_status: string | null
          trial_end: string | null
          trial_start: string | null
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
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
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
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
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
      get_public_landing_page: { Args: { page_slug: string }; Returns: Json }
      grant_grace_actions: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_page_view: { Args: { page_id: string }; Returns: undefined }
      increment_prospect_page_views: {
        Args: { page_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      reset_api_calls: { Args: never; Returns: undefined }
      reset_monthly_usage: { Args: never; Returns: undefined }
      track_ai_action: {
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
      app_role: "super_admin" | "admin" | "support"
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
      app_role: ["super_admin", "admin", "support"],
      plan_tier: ["starter", "pro", "agency"],
    },
  },
} as const
