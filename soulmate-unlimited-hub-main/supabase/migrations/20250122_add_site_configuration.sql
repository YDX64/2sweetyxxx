-- Create site_configuration table for storing ad and analytics settings
CREATE TABLE IF NOT EXISTS site_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('ads', 'analytics', 'general')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES profiles(id)
);

-- Create indexes
CREATE INDEX idx_site_configuration_key ON site_configuration(key);
CREATE INDEX idx_site_configuration_category ON site_configuration(category);

-- RLS policies
ALTER TABLE site_configuration ENABLE ROW LEVEL SECURITY;

-- Anyone can read active configuration
CREATE POLICY "Public can read active site configuration" ON site_configuration
  FOR SELECT USING (is_active = true);

-- Only admins can manage configuration
CREATE POLICY "Admins can manage site configuration" ON site_configuration
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Insert default configuration values
INSERT INTO site_configuration (key, value, description, category) VALUES
-- Google AdSense
('google_adsense_client_id', '', 'Google AdSense Client ID (ca-pub-xxxxxxxxxxxx)', 'ads'),
('google_adsense_enable_auto_ads', 'false', 'Enable AdSense Auto Ads', 'ads'),
('google_adsense_ad_slot_header', '', 'AdSense Slot ID for header ads', 'ads'),
('google_adsense_ad_slot_footer', '', 'AdSense Slot ID for footer ads', 'ads'),
('google_adsense_ad_slot_swipe', '', 'AdSense Slot ID for swipe interface ads', 'ads'),
('google_adsense_ad_slot_sidebar', '', 'AdSense Slot ID for sidebar ads', 'ads'),

-- Google Analytics
('google_analytics_id', '', 'Google Analytics Measurement ID (G-XXXXXXXXXX)', 'analytics'),
('google_analytics_enabled', 'false', 'Enable Google Analytics tracking', 'analytics'),
('google_tag_manager_id', '', 'Google Tag Manager ID (GTM-XXXXXXX)', 'analytics'),
('google_tag_manager_enabled', 'false', 'Enable Google Tag Manager', 'analytics'),

-- Facebook Pixel
('facebook_pixel_id', '', 'Facebook Pixel ID', 'analytics'),
('facebook_pixel_enabled', 'false', 'Enable Facebook Pixel tracking', 'analytics'),

-- Ad Settings
('ads_frequency_swipe', '5', 'Show ad after every N swipes', 'ads'),
('ads_frequency_matches', '3', 'Show ad after every N matches viewed', 'ads'),
('ads_enabled_mobile', 'true', 'Enable ads on mobile devices', 'ads'),
('ads_enabled_desktop', 'true', 'Enable ads on desktop', 'ads'),

-- Analytics Settings
('track_user_behavior', 'true', 'Track detailed user behavior', 'analytics'),
('track_page_views', 'true', 'Track page views', 'analytics'),
('track_swipe_actions', 'true', 'Track swipe actions', 'analytics'),
('track_match_interactions', 'true', 'Track match interactions', 'analytics')
ON CONFLICT (key) DO NOTHING;

-- Create ad_placements table for managing where ads appear
CREATE TABLE IF NOT EXISTS ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_key TEXT NOT NULL UNIQUE,
  placement_name TEXT NOT NULL,
  description TEXT,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'interstitial', 'native', 'rewarded')),
  platform TEXT NOT NULL CHECK (platform IN ('web', 'mobile', 'both')),
  position TEXT, -- e.g., 'top', 'bottom', 'between-profiles'
  is_active BOOLEAN DEFAULT TRUE,
  min_time_between_ads INTEGER DEFAULT 30, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default ad placements
INSERT INTO ad_placements (placement_key, placement_name, description, ad_type, platform, position) VALUES
('swipe_between_profiles', 'Between Profile Cards', 'Show ad between profile cards while swiping', 'interstitial', 'both', 'between-profiles'),
('swipe_header', 'Swipe Interface Header', 'Banner ad at the top of swipe interface', 'banner', 'both', 'top'),
('swipe_footer', 'Swipe Interface Footer', 'Banner ad at the bottom of swipe interface', 'banner', 'both', 'bottom'),
('match_list', 'Matches List', 'Native ad in matches list', 'native', 'both', 'list'),
('chat_list', 'Chat List', 'Native ad in chat list', 'native', 'both', 'list'),
('profile_view', 'Profile View', 'Banner ad when viewing full profile', 'banner', 'both', 'bottom'),
('rewarded_extra_likes', 'Extra Likes Reward', 'Watch ad to get extra likes', 'rewarded', 'both', 'modal')
ON CONFLICT (placement_key) DO NOTHING;

-- Create analytics_events table for custom event tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_data JSONB,
  page_path TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- RLS for analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own events
CREATE POLICY "Users can view own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert events (through service role)
CREATE POLICY "System can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Admins can view all events
CREATE POLICY "Admins can view all analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for site_configuration
CREATE TRIGGER update_site_configuration_updated_at
BEFORE UPDATE ON site_configuration
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();