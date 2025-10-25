import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { subscriptionLimits } from '@/services/subscriptionLimits';
import { boostService } from '@/services/boostService';
import { useAuth } from './useAuth';

interface SwipeLimits {
  // Like limits
  remainingLikes: number;
  maxLikes: number;
  canLike: boolean;
  
  // Super like limits
  remainingSuperLikes: number;
  maxSuperLikes: number;
  canSuperLike: boolean;
  
  // Boost limits
  remainingBoosts: number;
  maxBoosts: number;
  canBoost: boolean;
  
  // Loading state
  isInitialized: boolean;
  
  // Actions
  canPerformLike: () => Promise<{ allowed: boolean; reason?: string }>;
  canPerformSuperLike: () => Promise<{ allowed: boolean; reason?: string }>;
  recordLike: () => Promise<boolean>;
  recordSuperLike: () => Promise<void>;
  refreshLimits: () => Promise<void>;
}

export const useSwipeLimits = (): SwipeLimits => {
  const { user } = useAuth();
  const { 
    subscription_tier, 
    remainingLikes: subscriptionRemainingLikes,
    remainingSuperLikes: subscriptionRemainingSuperLikes,
    remainingMonthlyBoosts: subscriptionRemainingBoosts,
    usageLimits
  } = useSubscription();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [remainingBoosts, setRemainingBoosts] = useState(0);

  const checkLimits = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get boost limits from boost service
      const boosts = await boostService.getRemainingBoosts(user.id);
      setRemainingBoosts(boosts);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error checking limits:', error);
      setIsInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

  const canPerformLike = useCallback(async () => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };
    
    try {
      const result = await subscriptionLimits.checkCanLike(user.id, subscription_tier || 'registered');
      return { allowed: result.allowed, reason: result.reason };
    } catch (error) {
      return { allowed: false, reason: 'Error checking like limits' };
    }
  }, [user, subscription_tier]);

  const canPerformSuperLike = useCallback(async () => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };
    
    console.log('[useSwipeLimits] Checking SuperLike permission for tier:', subscription_tier);
    
    try {
      const result = await subscriptionLimits.checkCanSuperLike(user.id, subscription_tier || 'registered');
      console.log('[useSwipeLimits] SuperLike check result:', result);
      return { allowed: result.allowed, reason: result.reason };
    } catch (error) {
      console.error('[useSwipeLimits] SuperLike check error:', error);
      return { allowed: false, reason: 'Error checking super like limits' };
    }
  }, [user, subscription_tier]);

  const recordLike = useCallback(async () => {
    if (!user) return false;
    
    try {
      const result = await subscriptionLimits.checkAndRecordLike(user.id, subscription_tier || 'registered');
      await checkLimits();
      console.log('[useSwipeLimits] Like recorded successfully:', result);
      return result.allowed; // Return success status
    } catch (error) {
      console.error('Error recording like:', error);
      return false; // Return failure status
    }
  }, [user, subscription_tier, checkLimits]);

  const recordSuperLike = useCallback(async () => {
    if (!user) return;
    
    try {
      await subscriptionLimits.checkAndRecordSuperLike(user.id, subscription_tier || 'registered');
      await checkLimits();
    } catch (error) {
      console.error('Error recording super like:', error);
    }
  }, [user, subscription_tier, checkLimits]);

  return {
    // Like limits
    remainingLikes: subscriptionRemainingLikes,
    maxLikes: usageLimits.dailyLikesLimit,
    canLike: subscriptionRemainingLikes > 0,
    
    // Super like limits
    remainingSuperLikes: subscriptionRemainingSuperLikes,
    maxSuperLikes: usageLimits.dailySuperLikesLimit,
    canSuperLike: subscriptionRemainingSuperLikes > 0,
    
    // Boost limits
    remainingBoosts: subscriptionRemainingBoosts,
    maxBoosts: usageLimits.monthlyBoostsLimit,
    canBoost: subscriptionRemainingBoosts > 0,
    
    // Loading state
    isInitialized,
    
    // Actions
    canPerformLike,
    canPerformSuperLike,
    recordLike,
    recordSuperLike,
    refreshLimits: checkLimits
  };
};