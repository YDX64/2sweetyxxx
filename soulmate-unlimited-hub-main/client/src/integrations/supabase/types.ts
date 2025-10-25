export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      call_logs: {
        Row: {
          call_type: string
          caller_id: string
          conversation_id: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          receiver_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          call_type: string
          caller_id: string
          conversation_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          receiver_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          call_type?: string
          caller_id?: string
          conversation_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          receiver_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sessions: {
        Row: {
          call_type: string
          caller_id: string
          conversation_id: string | null
          created_at: string
          duration_seconds: number
          ended_at: string | null
          id: string
          receiver_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          call_type: string
          caller_id: string
          conversation_id?: string | null
          created_at?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          receiver_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          call_type?: string
          caller_id?: string
          conversation_id?: string | null
          created_at?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          receiver_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_signaling: {
        Row: {
          call_session_id: string
          created_at: string
          from_user_id: string
          id: string
          signal_data: Json
          signal_type: string
          to_user_id: string
        }
        Insert: {
          call_session_id: string
          created_at?: string
          from_user_id: string
          id?: string
          signal_data: Json
          signal_type: string
          to_user_id: string
        }
        Update: {
          call_session_id?: string
          created_at?: string
          from_user_id?: string
          id?: string
          signal_data?: Json
          signal_type?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_signaling_call_session_id_fkey"
            columns: ["call_session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant1_id: string
          participant2_id: string
          translation_enabled_by_user1: boolean | null
          translation_enabled_by_user2: boolean | null
          updated_at: string
          user1_language: string | null
          user2_language: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          participant1_id: string
          participant2_id: string
          translation_enabled_by_user1?: boolean | null
          translation_enabled_by_user2?: boolean | null
          updated_at?: string
          user1_language?: string | null
          user2_language?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          participant1_id?: string
          participant2_id?: string
          translation_enabled_by_user1?: boolean | null
          translation_enabled_by_user2?: boolean | null
          updated_at?: string
          user1_language?: string | null
          user2_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant1_id_fkey"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant2_id_fkey"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_translations: {
        Row: {
          created_at: string | null
          id: string
          message_id: string | null
          original_language: string
          target_language: string
          translated_content: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          original_language: string
          target_language: string
          translated_content: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          original_language?: string
          target_language?: string
          translated_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_translations_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_translations_cache: {
        Row: {
          created_at: string
          id: string
          message_id: string
          original_language: string
          target_language: string
          translated_content: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          original_language: string
          target_language: string
          translated_content: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          original_language?: string
          target_language?: string
          translated_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_translations_cache_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          children: string | null
          created_at: string
          daily_boosts: number | null
          daily_boosts_used: number | null
          daily_likes_used: number | null
          daily_rewinds: number | null
          daily_super_likes: number | null
          daily_super_likes_used: number | null
          daily_swipes: number | null
          drinking: string | null
          education: string | null
          email: string | null
          exercise: string | null
          gender: string | null
          height: number | null
          id: string
          interests: string[] | null
          interested_in: Database["public"]["Enums"]["interested_in"] | null
          is_banned: boolean | null
          languages: string[] | null
          last_boost_reset: string | null
          last_like_reset_date: string | null
          last_rewind_reset: string | null
          last_super_like_reset: string | null
          last_swipe_reset: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string | null
          occupation: string | null
          photos: string[] | null
          preferred_language: string | null
          relationship_type: string | null
          religion: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          sexual_orientation: Database["public"]["Enums"]["sexual_orientation"] | null
          smoking: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_expires_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          zodiac_sign: string | null
          verified: boolean | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          children?: string | null
          created_at?: string
          daily_boosts?: number | null
          daily_boosts_used?: number | null
          daily_likes_used?: number | null
          daily_rewinds?: number | null
          daily_super_likes?: number | null
          daily_super_likes_used?: number | null
          daily_swipes?: number | null
          drinking?: string | null
          education?: string | null
          email?: string | null
          exercise?: string | null
          gender?: string | null
          height?: number | null
          id: string
          interests?: string[] | null
          interested_in?: Database["public"]["Enums"]["interested_in"] | null
          is_banned?: boolean | null
          languages?: string[] | null
          last_boost_reset?: string | null
          last_like_reset_date?: string | null
          last_rewind_reset?: string | null
          last_super_like_reset?: string | null
          last_swipe_reset?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          occupation?: string | null
          photos?: string[] | null
          preferred_language?: string | null
          relationship_type?: string | null
          religion?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sexual_orientation?: Database["public"]["Enums"]["sexual_orientation"] | null
          smoking?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          zodiac_sign?: string | null
          verified?: boolean | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          children?: string | null
          created_at?: string
          daily_boosts?: number | null
          daily_boosts_used?: number | null
          daily_likes_used?: number | null
          daily_rewinds?: number | null
          daily_super_likes?: number | null
          daily_super_likes_used?: number | null
          daily_swipes?: number | null
          drinking?: string | null
          education?: string | null
          email?: string | null
          exercise?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          interests?: string[] | null
          interested_in?: Database["public"]["Enums"]["interested_in"] | null
          is_banned?: boolean | null
          languages?: string[] | null
          last_boost_reset?: string | null
          last_like_reset_date?: string | null
          last_rewind_reset?: string | null
          last_super_like_reset?: string | null
          last_swipe_reset?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          occupation?: string | null
          photos?: string[] | null
          preferred_language?: string | null
          relationship_type?: string | null
          religion?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sexual_orientation?: Database["public"]["Enums"]["sexual_orientation"] | null
          smoking?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          zodiac_sign?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      super_likes: {
        Row: {
          created_at: string
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_likes_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          created_at: string
          direction: string
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_user_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_user_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          lgbtq_friendly: boolean | null
          max_age: number | null
          max_distance: number | null
          min_age: number | null
          same_gender_enabled: boolean | null
          show_me: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lgbtq_friendly?: boolean | null
          max_age?: number | null
          max_distance?: number | null
          min_age?: number | null
          same_gender_enabled?: boolean | null
          show_me?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lgbtq_friendly?: boolean | null
          max_age?: number | null
          max_distance?: number | null
          min_age?: number | null
          same_gender_enabled?: boolean | null
          show_me?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_boosts: {
        Row: {
          id: string
          user_id: string
          boost_type: string
          duration_minutes: number
          started_at: string
          ends_at: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          boost_type: string
          duration_minutes?: number
          started_at?: string
          ends_at: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          boost_type?: string
          duration_minutes?: number
          started_at?: string
          ends_at?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_profiles: {
        Row: {
          id: string
          user_id: string
          video_url: string
          thumbnail_url: string | null
          duration_seconds: number
          file_size_mb: number
          status: string
          moderation_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          video_url: string
          thumbnail_url?: string | null
          duration_seconds: number
          file_size_mb: number
          status?: string
          moderation_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          video_url?: string
          thumbnail_url?: string | null
          duration_seconds?: number
          file_size_mb?: number
          status?: string
          moderation_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_data: Json | null
          timestamp: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_data?: Json | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_data?: Json | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_configuration: {
        Row: {
          id: string
          key: string
          value: string | null
          description: string | null
          category: 'ads' | 'analytics' | 'general'
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          description?: string | null
          category: 'ads' | 'analytics' | 'general'
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          description?: string | null
          category?: 'ads' | 'analytics' | 'general'
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_configuration_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          event_name: string
          event_category: string | null
          event_data: Json | null
          page_path: string | null
          user_agent: string | null
          ip_address: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_name: string
          event_category?: string | null
          event_data?: Json | null
          page_path?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_name?: string
          event_category?: string | null
          event_data?: Json | null
          page_path?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_placements: {
        Row: {
          id: string
          placement_id: string
          placement_name: string
          ad_format: 'banner' | 'native' | 'interstitial' | 'video'
          ad_slot: string | null
          is_active: boolean | null
          min_tier: 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          placement_id: string
          placement_name: string
          ad_format: 'banner' | 'native' | 'interstitial' | 'video'
          ad_slot?: string | null
          is_active?: boolean | null
          min_tier?: 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          placement_id?: string
          placement_name?: string
          ad_format?: 'banner' | 'native' | 'interstitial' | 'video'
          ad_slot?: string | null
          is_active?: boolean | null
          min_tier?: 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_usage_logs: {
        Row: {
          id: string
          user_id: string
          feature_name: string
          usage_count: number
          usage_date: string
          subscription_tier: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          feature_name: string
          usage_count?: number
          usage_date?: string
          subscription_tier?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          feature_name?: string
          usage_count?: number
          usage_date?: string
          subscription_tier?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewind_actions: {
        Row: {
          id: string
          user_id: string
          target_user_id: string
          action_type: string
          original_action_timestamp: string
          rewind_timestamp: string
          is_used: boolean
        }
        Insert: {
          id?: string
          user_id: string
          target_user_id: string
          action_type: string
          original_action_timestamp: string
          rewind_timestamp?: string
          is_used?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          target_user_id?: string
          action_type?: string
          original_action_timestamp?: string
          rewind_timestamp?: string
          is_used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "rewind_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewind_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          viewer_id: string
          viewed_id: string
          viewed_at: string
          is_premium_view: boolean
          view_date: string
        }
        Insert: {
          id?: string
          viewer_id: string
          viewed_id: string
          viewed_at?: string
          is_premium_view?: boolean
          view_date?: string
        }
        Update: {
          id?: string
          viewer_id?: string
          viewed_id?: string
          viewed_at?: string
          is_premium_view?: boolean
          view_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_id_fkey"
            columns: ["viewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_changes: {
        Row: {
          id: string
          user_id: string
          original_latitude: number | null
          original_longitude: number | null
          new_latitude: number
          new_longitude: number
          city_name: string | null
          country_code: string | null
          is_active: boolean
          started_at: string
          ends_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          original_latitude?: number | null
          original_longitude?: number | null
          new_latitude: number
          new_longitude: number
          city_name?: string | null
          country_code?: string | null
          is_active?: boolean
          started_at?: string
          ends_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          original_latitude?: number | null
          original_longitude?: number | null
          new_latitude?: number
          new_longitude?: number
          city_name?: string | null
          country_code?: string | null
          is_active?: boolean
          started_at?: string
          ends_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_changes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          id: string
          user_id: string
          verification_type: string
          status: string
          created_at: string
          updated_at: string
          verified_at: string | null
          document_url: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          verification_type: string
          status?: string
          created_at?: string
          updated_at?: string
          verified_at?: string | null
          document_url?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          verification_type?: string
          status?: string
          created_at?: string
          updated_at?: string
          verified_at?: string | null
          document_url?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_daily_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      activate_boost: {
        Args: {
          p_user_id: string
          p_boost_type?: string
          p_duration_minutes?: number
        }
        Returns: Json
      }
      perform_rewind: {
        Args: {
          p_user_id: string
          p_target_user_id: string
        }
        Returns: Json
      }
      track_feature_usage: {
        Args: {
          p_user_id: string
          p_feature_name: string
          p_subscription_tier?: string | null
        }
        Returns: undefined
      }
      get_user_premium_stats: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      cleanup_expired_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_rls_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_usage: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      increment_likes: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      current_setting: {
        Args: {
          setting_name: string
        }
        Returns: string
      }
    }
    Enums: {
      interested_in: "men" | "women" | "both"
      sexual_orientation: "heterosexual" | "homosexual" | "bisexual" | "pansexual" | "asexual"
      user_role: "registered" | "silver" | "gold" | "platinum" | "moderator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
