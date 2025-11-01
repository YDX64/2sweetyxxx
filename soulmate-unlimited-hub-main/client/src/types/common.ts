// Common type definitions to replace 'any' usage across the codebase

// Error types
export interface AppError extends Error {
  code?: string;
  details?: unknown;
  hint?: string;
}

// Supabase types
export interface SupabaseError {
  code: string;
  message: string;
  details?: unknown;
  hint?: string;
}

// Profile types for nested responses
export interface ProfileWithSubscription {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  location: string;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

// Super like types
export interface SuperLike {
  id: string;
  user_id: string;
  target_user_id: string;
  created_at: string;
  sender?: ProfileWithSubscription;
  recipient?: ProfileWithSubscription;
  target_profile?: ProfileWithSubscription;
}

// Profile view types
export interface ProfileView {
  id: string;
  viewer_id: string;
  viewed_id: string;
  viewed_at: string;
  viewer?: ProfileWithSubscription;
  viewed?: ProfileWithSubscription;
  viewer_profile?: ProfileWithSubscription;
}

// Rewind types
export interface Rewind {
  id: string;
  user_id: string;
  rewound_user_id: string;
  created_at: string;
  profiles?: ProfileWithSubscription;
}

// WebRTC call types
export interface CallRecord {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: 'video' | 'voice';
  started_at: string;
  ended_at: string | null;
  duration: number | null;
  caller?: ProfileWithSubscription;
  callee?: ProfileWithSubscription;
}

// Notification callback types
export type LikeNotificationCallback = (like: {
  id: string;
  user_id: string;
  target_user_id: string;
  created_at: string;
}) => void;

export type MatchNotificationCallback = (match: {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}) => void;

// Browser API types
export interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

export interface ConnectionInfo {
  effectiveType: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

export interface ExtendedNavigator extends Navigator {
  connection?: ConnectionInfo;
}

// Window extensions
export interface ExtendedWindow extends Window {
  trackEvent?: (eventName: string, eventData?: Record<string, unknown>) => void;
  logService?: unknown;
  checkSupabaseAuth?: () => Promise<void>;
  checkProfile?: () => Promise<void>;
}

// Event types
export interface TrackEventData {
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  timestamp?: string;
  [key: string]: unknown;
}

// Database update types
export interface ProfileUpdateData {
  daily_likes_used?: number;
  daily_super_likes_used?: number;
  daily_boosts_used?: number;
  last_like_reset_date?: string;
  last_super_like_reset?: string;
  last_swipe_reset?: string;
  daily_swipes?: number;
  role?: "registered" | "silver" | "gold" | "platinum" | "moderator" | "admin" | null;
  subscription_tier?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// Analytics types
export interface ViewAnalytics {
  totalViews: number;
  uniqueViewers: number;
  viewsByDate: Record<string, number>;
  viewsByTier: Record<string, number>;
  viewsByLocation: Record<string, number>;
  viewsLastWeek: number;
  viewsLastMonth: number;
  peakViewingHour: number;
  viewsByHour: Record<string, number>;
  viewsByViewerTier: Record<string, number>;
  viewsByViewedTier: Record<string, number>;
  uniqueViewed: number;
  averageViewsPerUser: number;
  mostActiveDay: string;
}

// Subscription types
export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Realtime subscription types
export interface RealtimeSubscription {
  unsubscribe: () => void;
}

// Log service types
export type LogCategory = 'AUTH' | 'DATABASE' | 'API' | 'UI' | 'PERFORMANCE' | 'NETWORK' | 'SYSTEM' | 'CUSTOM';
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  category: LogCategory;
  level: LogLevel;
  message: string;
  details?: unknown;
  userId?: string;
  timestamp: string;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  duration?: number;
  error?: string;
  responseTime?: number;
  success?: boolean;
}

// Type guards
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error;
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

// Helper type for unknown errors
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (isSupabaseError(error)) return error.message;
  return 'An unknown error occurred';
}

export function getErrorDetails(error: unknown): unknown {
  if (isAppError(error)) return { code: error.code, details: error.details, hint: error.hint };
  if (isSupabaseError(error)) return { code: error.code, details: error.details, hint: error.hint };
  if (error instanceof Error) return { name: error.name, message: error.message, stack: error.stack };
  return error;
}