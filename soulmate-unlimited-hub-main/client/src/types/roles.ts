export type UserRole = 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

export interface UserPermissions {
  swipe: { canAccess: boolean; dailyLimit: number | null };
  match: { canAccess: boolean; dailyLimit: number | null };
  message: { canAccess: boolean; dailyLimit: number | null };
  seeLikes: { canAccess: boolean; dailyLimit: number | null };
  unlimitedSwipes: { canAccess: boolean; dailyLimit: number | null };
  advancedFilters: { canAccess: boolean; dailyLimit: number | null };
  seeWhoLiked: { canAccess: boolean; dailyLimit: number | null };
  boostProfile: { canAccess: boolean; dailyLimit: number | null };
  voiceCall?: { canAccess: boolean; dailyLimit: number | null };
  videoCall?: { canAccess: boolean; dailyLimit: number | null };
  chatTranslation?: { canAccess: boolean; dailyLimit: number | null };
  prioritySupport?: { canAccess: boolean; dailyLimit: number | null };
  verifiedBadge?: { canAccess: boolean; dailyLimit: number | null };
  moderateUsers?: { canAccess: boolean; dailyLimit: number | null };
  banUsers?: { canAccess: boolean; dailyLimit: number | null };
  reviewReports?: { canAccess: boolean; dailyLimit: number | null };
  manageRoles?: { canAccess: boolean; dailyLimit: number | null };
  viewAnalytics?: { canAccess: boolean; dailyLimit: number | null };
  managePayments?: { canAccess: boolean; dailyLimit: number | null };
  systemSettings?: { canAccess: boolean; dailyLimit: number | null };
}

export interface RoleInfo {
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  color: string;
  bgGradient: string;
  features: string[];
  badge?: string;
}

// This will be populated with translations dynamically
export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  registered: {
    name: 'registered',
    displayName: 'Free',
    description: 'role.registered.description',
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: 'text-gray-600',
    bgGradient: 'from-gray-500 to-gray-600',
    features: [
      '✨ 10 Daily Likes',
      '💬 Basic Messaging',
      '🔍 Basic Filters (Age, Distance)',
      '📱 Mobile & Web Access',
      '🔐 Secure & Private'
    ]
  },
  silver: {
    name: 'silver',
    displayName: 'Silver',
    description: 'role.silver.description',
    monthlyPrice: 999,
    yearlyPrice: 9999,
    color: 'text-gray-400',
    bgGradient: 'from-gray-400 to-gray-500',
    features: [
      '❤️ 50 Daily Likes',
      '⭐ 5 Super Likes per day',
      '🎯 Advanced Filters',
      '👀 See Who Likes You',
      '🚀 1 Boost per month',
      '⏮️ Rewind',
      '📞 Voice Calls'
    ],
    badge: 'SILVER'
  },
  gold: {
    name: 'gold',
    displayName: 'Gold',
    description: 'role.gold.description',
    monthlyPrice: 1999,
    yearlyPrice: 19999,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-400 to-amber-500',
    features: [
      '💖 100 Daily Likes',
      '⭐ 10 Super Likes per day',
      '🚀 3 Boosts per month',
      '👻 Invisible Browsing',
      '🌍 Passport',
      '📞 HD Video Calls',
      '🎯 All Silver Features'
    ],
    badge: 'GOLD'
  },
  platinum: {
    name: 'platinum',
    displayName: 'Platinum',
    description: 'role.platinum.description',
    monthlyPrice: 2999,
    yearlyPrice: 29999,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500 to-pink-500',
    features: [
      '💎 Unlimited Likes',
      '⭐ 25 Super Likes per day',
      '🚀 10 Boosts per month',
      '📊 Profile Analytics',
      '👑 VIP Matching',
      '🌐 Multi-language Translation',
      '🔥 All Gold Features'
    ],
    badge: 'PLATINUM'
  },
  moderator: {
    name: 'moderator',
    displayName: 'Moderator',
    description: 'role.moderator.description',
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500 to-blue-600',
    features: [
      'feature.allPremiumFeatures',
      'feature.userModeration',
      'feature.contentReview',
      'feature.reportManagement'
    ],
    badge: 'MOD'
  },
  admin: {
    name: 'admin',
    displayName: 'Admin',
    description: 'role.admin.description',
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: 'text-red-400',
    bgGradient: 'from-red-500 to-red-600',
    features: [
      'feature.fullSystemAccess',
      'feature.userManagement',
      'feature.paymentManagement',
      'feature.systemSettings'
    ],
    badge: 'ADMIN'
  }
};

// Helper function to get role info with translations
export const getRoleInfo = (role: UserRole, t: (key: string) => string): RoleInfo => {
  const roleInfo = ROLE_INFO[role];
  return {
    ...roleInfo,
    displayName: t(role),
    description: t(roleInfo.description),
    features: roleInfo.features.map(feature => t(feature))
  };
};

export interface Subscription {
  id: string;
  userId: string;
  tier: UserRole;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  paymentMethod?: string;
  transactionId?: string;
  startsAt: string;
  expiresAt: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ModerationLog {
  id: string;
  moderatorId: string;
  targetUserId: string;
  action: 'ban' | 'unban' | 'warn' | 'delete_content' | 'change_role';
  reason?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}
