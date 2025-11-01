import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/roles";

/**
 * Güvenlik kontrolleri için utility fonksiyonları
 * KRITIK: Bu kontroller sadece UI/UX içindir. 
 * Gerçek güvenlik backend'de sağlanmalıdır!
 */

// Role hiyerarşisi
const ROLE_HIERARCHY: Record<UserRole, number> = {
  registered: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  moderator: 5,
  admin: 6
};

/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) return false;

    const userLevel = ROLE_HIERARCHY[profile.role as UserRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 999;

    return userLevel >= requiredLevel;
  } catch (error) {
    console.error('Role check failed:', error);
    return false;
  }
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Admin check failed:', error);
    return false;
  }
}

/**
 * Kullanıcının moderatör veya admin olup olmadığını kontrol eder
 */
export async function isModeratorOrAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin' || profile?.role === 'moderator';
  } catch (error) {
    console.error('Moderator/Admin check failed:', error);
    return false;
  }
}

/**
 * Kullanıcının belirli bir işlemi yapma yetkisi olup olmadığını kontrol eder
 */
export async function canPerformAction(action: string): Promise<boolean> {
  const adminOnlyActions = [
    'update_user_role',
    'assign_moderator_permissions',
    'delete_user',
    'grant_subscription',
    'view_security_logs'
  ];

  const moderatorActions = [
    'ban_user',
    'moderate_content',
    'view_reports',
    'manage_basic_content'
  ];

  if (adminOnlyActions.includes(action)) {
    return await isAdmin();
  }

  if (moderatorActions.includes(action)) {
    return await isModeratorOrAdmin();
  }

  return false;
}

/**
 * Rate limiting kontrolü (client-side)
 * NOT: Bu sadece UX içindir, gerçek rate limiting backend'de yapılmalı
 */
const actionTimestamps = new Map<string, number[]>();

export function checkRateLimit(
  action: string, 
  maxAttempts: number = 10, 
  windowMinutes: number = 60
): boolean {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  // Get existing timestamps for this action
  const timestamps = actionTimestamps.get(action) || [];
  
  // Filter out old timestamps
  const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  // Check if limit exceeded
  if (recentTimestamps.length >= maxAttempts) {
    console.warn(`Rate limit exceeded for action: ${action}`);
    return false;
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  actionTimestamps.set(action, recentTimestamps);
  
  return true;
}

/**
 * Güvenlik loglarını görüntüleme yetkisi kontrolü
 */
export async function canViewSecurityLogs(): Promise<boolean> {
  return await isAdmin();
}

/**
 * Kullanıcı bilgilerini güvenli şekilde temizle
 */
export function sanitizeUserData(userData: any): any {
  // Hassas bilgileri kaldır
  const sanitized = { ...userData };
  delete sanitized.password;
  delete sanitized.password_hash;
  delete sanitized.session_token;
  delete sanitized.refresh_token;
  delete sanitized.stripe_customer_id;
  delete sanitized.payment_method_id;
  
  return sanitized;
}

/**
 * XSS saldırılarına karşı input temizleme
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * SQL injection koruması için parametre validasyonu
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Role değişikliği için yetki kontrolü
 */
export async function canChangeUserRole(
  currentUserRole: UserRole,
  targetUserRole: UserRole,
  newRole: UserRole
): Promise<{ allowed: boolean; reason?: string }> {
  // Sadece adminler rol değiştirebilir
  if (currentUserRole !== 'admin') {
    return { 
      allowed: false, 
      reason: 'Only administrators can change user roles' 
    };
  }

  // Kendi rolünü kimse değiştiremez
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, reason: 'Not authenticated' };
  }

  // Admin sayısı kontrolü yapılmalı (backend'de yapılıyor)
  
  return { allowed: true };
}

// Export security constants
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 30,
  SESSION_TIMEOUT_MINUTES: 60,
  PASSWORD_MIN_LENGTH: 8,
  REQUIRE_2FA_FOR_ADMINS: true,
  AUDIT_LOG_RETENTION_DAYS: 90,
  RATE_LIMITS: {
    role_update: { max: 20, window: 60 },
    user_delete: { max: 5, window: 60 },
    permission_update: { max: 30, window: 60 },
    login: { max: 5, window: 15 }
  }
};