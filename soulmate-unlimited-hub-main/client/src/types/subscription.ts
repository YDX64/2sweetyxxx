export type SubscriptionTier = 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin';

export interface SubscriptionFeatures {
  // Görüntüleme limitleri
  dailyLikes: number;
  dailySuperlikes: number;
  monthlyBoosts: number;
  
  // Mesajlaşma özellikleri
  unlimitedMessages: boolean;
  priorityMessages: boolean;
  readReceipts: boolean;
  
  // Arama ve keşif
  advancedFilters: boolean;
  locationChange: boolean;
  invisibleBrowsing: boolean;
  seeWhoLikesYou: boolean;
  
  // Profil özellikleri
  maxPhotos: number;
  videoProfile: boolean;
  profileBoost: boolean;
  
  // Premium özellikler
  rewindFeature: boolean;
  passportFeature: boolean;
  topPicksAccess: boolean;
  adsDisabled: boolean; // Added for Silver+ users
  
  // Call özellikleri (Gold+)
  voiceCalls: boolean;
  videoCalls: boolean;
  
  // Translation özellikleri (Platinum+)
  multiLanguageChat: boolean;
  
  // Admin özellikleri
  adminPanel: boolean;
  userManagement: boolean;
  contentModeration: boolean;
  systemSettings: boolean;
  analytics: boolean;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: SubscriptionTier;
  subscription_end: string | null;
  loading: boolean;
  features: SubscriptionFeatures;
}

// Her tier için özellik tanımları
export const TIER_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  registered: {
    dailyLikes: 10,
    dailySuperlikes: 0,
    monthlyBoosts: 0,
    unlimitedMessages: false,
    priorityMessages: false,
    readReceipts: false,
    advancedFilters: false,
    locationChange: false,
    invisibleBrowsing: false,
    seeWhoLikesYou: false,
    maxPhotos: 6,
    videoProfile: false,
    profileBoost: false,
    rewindFeature: false,
    passportFeature: false,
    topPicksAccess: false,
    adsDisabled: false,
    voiceCalls: false,
    videoCalls: false,
    multiLanguageChat: false,
    adminPanel: false,
    userManagement: false,
    contentModeration: false,
    systemSettings: false,
    analytics: false,
  },
  silver: {
    dailyLikes: 50,
    dailySuperlikes: 5,
    monthlyBoosts: 1,
    unlimitedMessages: true,
    priorityMessages: false,
    readReceipts: true,
    advancedFilters: true,
    locationChange: false,
    invisibleBrowsing: false,
    seeWhoLikesYou: true,
    maxPhotos: 10,
    videoProfile: false,
    profileBoost: false,
    rewindFeature: true,
    passportFeature: false,
    topPicksAccess: false,
    adsDisabled: true,
    voiceCalls: true,
    videoCalls: true,
    multiLanguageChat: false,
    adminPanel: false,
    userManagement: false,
    contentModeration: false,
    systemSettings: false,
    analytics: false,
  },
  gold: {
    dailyLikes: 100,
    dailySuperlikes: 10,
    monthlyBoosts: 3,
    unlimitedMessages: true,
    priorityMessages: true,
    readReceipts: true,
    advancedFilters: true,
    locationChange: true,
    invisibleBrowsing: true,
    seeWhoLikesYou: true,
    maxPhotos: 10,
    videoProfile: true,
    profileBoost: true,
    rewindFeature: true,
    passportFeature: true,
    topPicksAccess: true,
    adsDisabled: true,
    voiceCalls: true,
    videoCalls: true,
    multiLanguageChat: false,
    adminPanel: false,
    userManagement: false,
    contentModeration: false,
    systemSettings: false,
    analytics: false,
  },
  moderator: {
    dailyLikes: 999,
    dailySuperlikes: 999,
    monthlyBoosts: 999,
    unlimitedMessages: true,
    priorityMessages: true,
    readReceipts: true,
    advancedFilters: true,
    locationChange: true,
    invisibleBrowsing: true,
    seeWhoLikesYou: true,
    maxPhotos: 25,
    videoProfile: true,
    profileBoost: true,
    rewindFeature: true,
    passportFeature: true,
    topPicksAccess: true,
    adsDisabled: true,
    voiceCalls: true,
    videoCalls: true,
    multiLanguageChat: true,
    adminPanel: false,
    userManagement: false,
    contentModeration: true,
    systemSettings: false,
    analytics: true,
  },
  platinum: {
    dailyLikes: 999,
    dailySuperlikes: 25,
    monthlyBoosts: 10,
    unlimitedMessages: true,
    priorityMessages: true,
    readReceipts: true,
    advancedFilters: true,
    locationChange: true,
    invisibleBrowsing: true,
    seeWhoLikesYou: true,
    maxPhotos: 15,
    videoProfile: true,
    profileBoost: true,
    rewindFeature: true,
    passportFeature: true,
    topPicksAccess: true,
    adsDisabled: true,
    voiceCalls: true,
    videoCalls: true,
    multiLanguageChat: true,
    adminPanel: false,
    userManagement: false,
    contentModeration: false,
    systemSettings: false,
    analytics: false,
  },
  admin: {
    dailyLikes: 999,
    dailySuperlikes: 999,
    monthlyBoosts: 999,
    unlimitedMessages: true,
    priorityMessages: true,
    readReceipts: true,
    advancedFilters: true,
    locationChange: true,
    invisibleBrowsing: true,
    seeWhoLikesYou: true,
    maxPhotos: 25,
    videoProfile: true,
    profileBoost: true,
    rewindFeature: true,
    passportFeature: true,
    topPicksAccess: true,
    adsDisabled: true,
    voiceCalls: true,
    videoCalls: true,
    multiLanguageChat: true,
    adminPanel: true,
    userManagement: true,
    contentModeration: true,
    systemSettings: true,
    analytics: true,
  },
};

// Tier isimleri ve açıklamaları
export const TIER_INFO = {
  registered: {
    name: 'Ücretsiz Üye',
    displayName: 'Free',
    description: 'Temel özellikler',
    color: 'gray',
    bgGradient: 'from-gray-500 to-gray-600',
    icon: '👤',
  },
  silver: {
    name: 'Silver',
    displayName: 'Silver',
    description: 'Gelişmiş özellikler',
    color: 'gray',
    bgGradient: 'from-gray-400 to-gray-500',
    icon: '🥈',
    price: 9.99,
  },
  gold: {
    name: 'Gold',
    displayName: 'Gold',
    description: 'Profesyonel özellikler',
    color: 'yellow',
    bgGradient: 'from-yellow-400 to-amber-500',
    icon: '🥇',
    price: 19.99,
  },
  moderator: {
    name: 'Moderatör',
    displayName: 'Moderator',
    description: 'İçerik yönetimi',
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    icon: '⚖️',
  },
  platinum: {
    name: 'Platinum',
    displayName: 'Platinum',
    description: 'VIP deneyim',
    color: 'purple',
    bgGradient: 'from-purple-500 to-pink-500',
    icon: '👑',
    price: 29.99,
  },
  admin: {
    name: 'Yönetici',
    displayName: 'Admin',
    description: 'Tam yetkili erişim',
    color: 'red',
    bgGradient: 'from-red-500 to-red-600',
    icon: '🛡️',
  },
};
