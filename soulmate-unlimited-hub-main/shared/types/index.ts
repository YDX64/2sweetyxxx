// Shared types for web and mobile platforms

export interface User {
  id: string;
  email?: string;
  name?: string;
  age?: number;
  photos?: string[];
  bio?: string;
  location?: string;
  gender?: string;
  interested_in?: string;
  subscription_tier?: string;
  verified?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SwipeAction {
  id: string;
  user_id: string;
  target_user_id: string;
  direction: 'left' | 'right';
  created_at: string;
  is_super_like?: boolean;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  last_message_at?: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type?: 'text' | 'image' | 'voice';
  image_url?: string;
}

export interface SubscriptionTier {
  name: 'registered' | 'silver' | 'gold' | 'platinum' | 'admin';
  dailyLikes: number;
  dailySuperLikes: number;
  canSeeWhoLikesYou: boolean;
  canUseBoost: boolean;
  canRewind: boolean;
  unlimitedSwipes: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ProfilePreferences {
  min_age?: number;
  max_age?: number;
  distance?: number;
  interested_in?: string;
  show_me?: string;
}

// Real-time event types
export interface RealtimeSwipeEvent {
  type: 'swipe';
  data: SwipeAction;
}

export interface RealtimeMatchEvent {
  type: 'match';
  data: Match;
}

export interface RealtimeMessageEvent {
  type: 'message';
  data: Message;
}

export type RealtimeEvent = RealtimeSwipeEvent | RealtimeMatchEvent | RealtimeMessageEvent;