// Temporary patch for missing database types until types are regenerated
// This file contains the missing table definitions

export interface SiteConfiguration {
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
}

export interface AnalyticsEvents {
  Row: {
    id: string
    user_id: string | null
    session_id: string | null
    event_name: string
    event_category: string | null
    event_data: any | null
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
    event_data?: any | null
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
    event_data?: any | null
    page_path?: string | null
    user_agent?: string | null
    ip_address?: string | null
    created_at?: string | null
  }
}

export interface AdPlacements {
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
}