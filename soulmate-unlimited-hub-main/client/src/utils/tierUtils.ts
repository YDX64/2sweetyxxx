import { SubscriptionTier } from '@/types/subscription';

export const getTierGradientClass = (tier: SubscriptionTier): string => {
  switch (tier) {
    case 'silver':
      return 'tier-gradient-silver';
    case 'gold':
      return 'tier-gradient-gold';
    case 'platinum':
      return 'tier-gradient-platinum';
    case 'moderator':
      return 'tier-gradient-moderator';
    case 'admin':
      return 'tier-gradient-admin';
    case 'registered':
    default:
      return 'bg-gray-500';
  }
};

export const getTierTextColorClass = (tier: SubscriptionTier): string => {
  switch (tier) {
    case 'silver':
      return 'text-gray-400';
    case 'gold':
      return 'text-yellow-500';
    case 'platinum':
      return 'text-purple-500';
    case 'moderator':
      return 'text-blue-500';
    case 'admin':
      return 'text-red-500';
    case 'registered':
    default:
      return 'text-gray-500';
  }
};

export const getTierBadgeStyle = (tier: SubscriptionTier): string => {
  const gradientClass = getTierGradientClass(tier);
  return `${gradientClass} text-white border-0`;
};