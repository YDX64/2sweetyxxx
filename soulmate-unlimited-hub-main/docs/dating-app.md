# Dating Uygulaması: Vite + React + Supabase ile Adım Adım Implementasyon Rehberi

## 1. Supabase'de User Roles ve Subscription Sisteminin Doğru Kurulumu

### Database Schema Tasarımı

```sql
-- Subscription tiers tablosu
CREATE TABLE subscription_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('free', 'silver', 'gold', 'platinum')),
  price_monthly INTEGER NOT NULL, -- kuruş cinsinden
  price_yearly INTEGER,
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı profilleri tablosu
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  age INTEGER CHECK (age >= 18),
  gender TEXT,
  bio TEXT,
  location GEOGRAPHY(POINT),
  photos JSONB DEFAULT '[]',
  subscription_tier_id UUID REFERENCES subscription_tiers(id) DEFAULT (SELECT id FROM subscription_tiers WHERE name = 'free'),
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  daily_likes_used INTEGER DEFAULT 0,
  daily_likes_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Politikaları
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi profillerini görebilir ve güncelleyebilir
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### RLS Politikaları ile Subscription Kontrolü

```sql
-- Subscription'a göre profil görüntüleme politikası
CREATE POLICY "View profiles based on subscription" ON profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR -- Kendi profilini görebilir
    (
      -- Free kullanıcılar sadece temel bilgileri görebilir
      CASE 
        WHEN (SELECT subscription_tier_id FROM profiles WHERE id = auth.uid()) = 
             (SELECT id FROM subscription_tiers WHERE name = 'free')
        THEN (SELECT COUNT(*) FROM jsonb_array_elements(photos) WHERE jsonb_array_length(photos) > 0) <= 1
        ELSE true -- Premium kullanıcılar tüm bilgileri görebilir
      END
    )
  );

-- Feature access kontrolü için function
CREATE OR REPLACE FUNCTION check_feature_access(user_id UUID, feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  user_tier TEXT;
  tier_features JSONB;
BEGIN
  SELECT st.name, st.features 
  INTO user_tier, tier_features
  FROM profiles p
  JOIN subscription_tiers st ON p.subscription_tier_id = st.id
  WHERE p.id = user_id;
  
  RETURN tier_features ? feature_name AND (tier_features->>feature_name)::boolean;
END;
$$;
```

## 2. Subscription Tier'larının Implementasyonu

### Tier Yapılandırması

```javascript
// constants/subscriptionTiers.js
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'free',
    price: 0,
    features: {
      verification_badge: true,
      daily_likes: 10,
      super_likes: 0,
      boosts: 0,
      advanced_filters: false,
      see_who_likes: false,
      rewind: false,
      voice_calls: false,
      video_calls: false,
      no_ads: false
    }
  },
  SILVER: {
    name: 'silver',
    price: 999, // $9.99
    features: {
      verification_badge: true,
      daily_likes: 50,
      super_likes: 5,
      boosts: 1,
      advanced_filters: true,
      see_who_likes: true,
      rewind: true,
      voice_calls: true,
      video_calls: false,
      no_ads: true
    }
  },
  GOLD: {
    name: 'gold',
    price: 1999, // $19.99
    features: {
      verification_badge: true,
      daily_likes: 100,
      super_likes: 10,
      boosts: 3,
      advanced_filters: true,
      see_who_likes: true,
      rewind: true,
      voice_calls: true,
      video_calls: true,
      invisible_browsing: true,
      passport: true,
      no_ads: true
    }
  },
  PLATINUM: {
    name: 'platinum',
    price: 2999, // $29.99
    features: {
      verification_badge: true,
      daily_likes: -1, // Unlimited
      super_likes: 25,
      boosts: 10,
      advanced_filters: true,
      see_who_likes: true,
      rewind: true,
      voice_calls: true,
      video_calls: true,
      invisible_browsing: true,
      passport: true,
      profile_analytics: true,
      vip_matching: true,
      translation: true,
      no_ads: true
    }
  }
};
```

### Subscription Hook

```javascript
// hooks/useSubscription.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
    
    // Real-time subscription updates
    const subscription = supabase
      .channel('subscription_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${supabase.auth.user()?.id}`
      }, handleSubscriptionChange)
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const fetchSubscription = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        subscription_tier_id,
        subscription_status,
        subscription_expires_at,
        subscription_tiers (
          name,
          features,
          limits
        )
      `)
      .eq('id', supabase.auth.user()?.id)
      .single();

    if (!error) {
      setSubscription(data);
    }
    setLoading(false);
  };

  const handleSubscriptionChange = (payload) => {
    setSubscription(prev => ({
      ...prev,
      ...payload.new
    }));
  };

  const hasFeature = (featureName) => {
    if (!subscription) return false;
    const features = subscription.subscription_tiers?.features || {};
    return features[featureName] === true;
  };

  const getLimit = (limitName) => {
    if (!subscription) return 0;
    const limits = subscription.subscription_tiers?.limits || {};
    return limits[limitName] || 0;
  };

  return {
    subscription,
    loading,
    hasFeature,
    getLimit,
    isActive: subscription?.subscription_status === 'active',
    tier: subscription?.subscription_tiers?.name || 'free'
  };
};
```

## 3. Her Tier'a Özel Özelliklerin Yönetimi

### Feature Gate Component

```javascript
// components/FeatureGate.jsx
import { useSubscription } from '../hooks/useSubscription';

const FeatureGate = ({ feature, fallback = null, children }) => {
  const { hasFeature, loading } = useSubscription();

  if (loading) return null;
  
  if (!hasFeature(feature)) {
    return fallback || <UpgradePrompt feature={feature} />;
  }

  return children;
};

// Kullanım örneği
<FeatureGate feature="advanced_filters" fallback={<BasicFilters />}>
  <AdvancedFilters />
</FeatureGate>
```

### Daily Limits Management

```javascript
// services/limitsService.js
export class LimitsService {
  static async checkAndIncrementUsage(userId, actionType) {
    const { data, error } = await supabase.rpc('check_and_increment_usage', {
      p_user_id: userId,
      p_action_type: actionType
    });

    if (error) throw error;
    return data; // true if within limit
  }

  static async getRemainingLikes(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('daily_likes_used, subscription_tiers(limits)')
      .eq('id', userId)
      .single();

    const limit = data.subscription_tiers.limits.daily_likes;
    if (limit === -1) return 'unlimited';
    
    return Math.max(0, limit - data.daily_likes_used);
  }
}

// React component for like button
const LikeButton = ({ targetUserId }) => {
  const [canLike, setCanLike] = useState(true);
  const { subscription } = useSubscription();

  const handleLike = async () => {
    try {
      const withinLimit = await LimitsService.checkAndIncrementUsage(
        supabase.auth.user().id,
        'like'
      );

      if (!withinLimit) {
        toast.error('Daily like limit reached! Upgrade for more.');
        return;
      }

      await supabase.from('user_actions').insert({
        actor_id: supabase.auth.user().id,
        target_id: targetUserId,
        action_type: 'like'
      });

      toast.success('Liked!');
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  return (
    <button 
      onClick={handleLike} 
      disabled={!canLike}
      className="like-button"
    >
      <HeartIcon />
    </button>
  );
};
```

## 4. Dating App Özelliklerinin Teknik Implementasyonu

### Matching Algoritması

```javascript
// services/matchingService.js
export class MatchingService {
  // Konum tabanlı eşleştirme
  static async findNearbyUsers(userId, radiusKm = 50) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('location')
      .eq('id', userId)
      .single();

    const { data: nearbyUsers } = await supabase.rpc('find_nearby_users', {
      user_location: userProfile.location,
      radius_km: radiusKm,
      user_id: userId
    });

    return nearbyUsers;
  }

  // Tercih tabanlı eşleştirme
  static calculateCompatibilityScore(user1, user2) {
    const weights = {
      age: 0.2,
      interests: 0.3,
      location: 0.2,
      values: 0.3
    };

    let score = 0;

    // Yaş uyumluluğu
    const ageDiff = Math.abs(user1.age - user2.age);
    score += weights.age * Math.max(0, 1 - ageDiff / 10);

    // Ortak ilgi alanları
    const commonInterests = user1.interests.filter(i => 
      user2.interests.includes(i)
    ).length;
    score += weights.interests * (commonInterests / user1.interests.length);

    // Mesafe skoru
    const distance = this.calculateDistance(user1.location, user2.location);
    score += weights.location * Math.max(0, 1 - distance / 100);

    return score;
  }

  // ML tabanlı eşleştirme (Supabase Edge Function)
  static async getMLRecommendations(userId) {
    const { data } = await supabase.functions.invoke('ml-matching', {
      body: { userId }
    });
    return data.recommendations;
  }
}
```

### Swipe Mekanizması

```javascript
// components/SwipeCard.jsx
import { useState } from 'react';
import { useSprings, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';

const SwipeCard = ({ profiles, onSwipe }) => {
  const [gone] = useState(() => new Set());
  
  const [props, api] = useSprings(profiles.length, i => ({
    x: 0,
    y: 0,
    scale: 1,
    rot: 0
  }));

  const bind = useDrag(({ args: [index], active, movement: [mx], velocity }) => {
    const trigger = velocity > 0.2;
    const dir = mx < 0 ? -1 : 1;
    
    if (!active && trigger) gone.add(index);
    
    api.start(i => {
      if (index !== i) return;
      const isGone = gone.has(index);
      const x = isGone ? (200 + window.innerWidth) * dir : active ? mx : 0;
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0);
      const scale = active ? 1.1 : 1;
      
      if (isGone) {
        onSwipe(dir > 0 ? 'like' : 'pass', profiles[index]);
      }
      
      return {
        x,
        rot,
        scale,
        config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 }
      };
    });
  });

  return (
    <div className="swipe-container">
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div
          key={profiles[i].id}
          {...bind(i)}
          style={{
            transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
            transform: interpolate([rot, scale], trans)
          }}
        >
          <ProfileCard profile={profiles[i]} />
        </animated.div>
      ))}
    </div>
  );
};
```

### Boost Mekanizması

```javascript
// services/boostService.js
export class BoostService {
  static async activateBoost(userId, duration = 30) {
    // Boost limitini kontrol et
    const canBoost = await LimitsService.checkAndIncrementUsage(userId, 'boost');
    
    if (!canBoost) {
      throw new Error('Boost limit reached');
    }

    // Boost'u aktifleştir
    const { data, error } = await supabase
      .from('boosts')
      .insert({
        user_id: userId,
        started_at: new Date(),
        expires_at: new Date(Date.now() + duration * 60 * 1000),
        is_active: true
      });

    if (error) throw error;

    // Visibility score'u güncelle
    await supabase.rpc('update_visibility_score', {
      user_id: userId,
      boost_multiplier: 10
    });

    return data;
  }

  static async getActiveBoost(userId) {
    const { data } = await supabase
      .from('boosts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('expires_at', new Date())
      .single();

    return data;
  }
}

// Boost Component
const BoostButton = () => {
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { getLimit } = useSubscription();

  useEffect(() => {
    checkActiveBoost();
    const interval = setInterval(checkActiveBoost, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkActiveBoost = async () => {
    const boost = await BoostService.getActiveBoost(supabase.auth.user().id);
    if (boost) {
      setIsBoostActive(true);
      const remaining = new Date(boost.expires_at) - new Date();
      setTimeRemaining(Math.max(0, Math.floor(remaining / 60000)));
    } else {
      setIsBoostActive(false);
    }
  };

  const activateBoost = async () => {
    try {
      await BoostService.activateBoost(supabase.auth.user().id);
      toast.success('Boost activated! You\'re now 10x more visible.');
      checkActiveBoost();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isBoostActive) {
    return (
      <div className="boost-active">
        <RocketIcon className="animate-pulse" />
        <span>{timeRemaining} min remaining</span>
      </div>
    );
  }

  const boostsRemaining = getLimit('boosts_per_month');
  
  return (
    <button 
      onClick={activateBoost}
      disabled={boostsRemaining === 0}
      className="boost-button"
    >
      <RocketIcon />
      <span>Boost ({boostsRemaining} left)</span>
    </button>
  );
};
```

## 5. Stripe Ödeme Sistemi Entegrasyonu

### Stripe Setup ve Webhook Handler

```javascript
// api/stripe-webhook.js (Supabase Edge Function)
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

export default async function handler(request) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
}

async function handleSubscriptionChange(subscription) {
  const { customer, status, current_period_end, items } = subscription;
  
  // Stripe metadata'dan tier ismini al
  const tierName = items.data[0].price.metadata.tier;
  
  // Tier ID'sini bul
  const { data: tier } = await supabaseAdmin
    .from('subscription_tiers')
    .select('id')
    .eq('name', tierName)
    .single();

  // Kullanıcıyı güncelle
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier_id: tier.id,
      subscription_status: status,
      subscription_expires_at: new Date(current_period_end * 1000).toISOString()
    })
    .eq('stripe_customer_id', customer);
}
```

### React Checkout Flow

```javascript
// components/SubscriptionPlans.jsx
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SubscriptionPlans = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async (priceId) => {
    setLoading(true);
    
    try {
      // Checkout session oluştur
      const { data } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/plans`
        }
      });

      // Stripe Checkout'a yönlendir
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-plans">
      <div className="plan-card">
        <h3>Silver</h3>
        <p className="price">$9.99/month</p>
        <ul className="features">
          <li>✓ 50 daily likes</li>
          <li>✓ 5 super likes</li>
          <li>✓ See who likes you</li>
          <li>✓ Advanced filters</li>
          <li>✓ Voice calls</li>
          <li>✓ No ads</li>
        </ul>
        <button 
          onClick={() => handleSubscribe('price_silver_monthly')}
          disabled={loading}
        >
          Get Silver
        </button>
      </div>
      
      <div className="plan-card featured">
        <h3>Gold</h3>
        <p className="price">$19.99/month</p>
        <ul className="features">
          <li>✓ 100 daily likes</li>
          <li>✓ 10 super likes</li>
          <li>✓ 3 boosts/month</li>
          <li>✓ HD video calls</li>
          <li>✓ Invisible browsing</li>
          <li>✓ Passport feature</li>
        </ul>
        <button 
          onClick={() => handleSubscribe('price_gold_monthly')}
          disabled={loading}
        >
          Get Gold
        </button>
      </div>
      
      <div className="plan-card">
        <h3>Platinum</h3>
        <p className="price">$29.99/month</p>
        <ul className="features">
          <li>✓ Unlimited likes</li>
          <li>✓ 25 super likes</li>
          <li>✓ 10 boosts/month</li>
          <li>✓ Profile analytics</li>
          <li>✓ VIP matching</li>
          <li>✓ Translation</li>
        </ul>
        <button 
          onClick={() => handleSubscribe('price_platinum_monthly')}
          disabled={loading}
        >
          Get Platinum
        </button>
      </div>
    </div>
  );
};
```

## 6. Feature Flag Sistemi ve Özellik Erişim Kontrolü

### Custom Feature Flag Implementation

```javascript
// services/featureFlagService.js
export class FeatureFlagService {
  static async getFlags(userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tiers(features)')
      .eq('id', userId)
      .single();

    const { data: globalFlags } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('is_active', true);

    return {
      subscription: profile.subscription_tiers.features,
      global: globalFlags.reduce((acc, flag) => ({
        ...acc,
        [flag.name]: flag.enabled
      }), {})
    };
  }

  static async isFeatureEnabled(userId, featureName) {
    const flags = await this.getFlags(userId);
    return flags.subscription[featureName] || flags.global[featureName] || false;
  }
}

// Feature Flag Provider
import { createContext, useContext, useEffect, useState } from 'react';

const FeatureFlagContext = createContext({});

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    const userId = supabase.auth.user()?.id;
    if (userId) {
      const flags = await FeatureFlagService.getFlags(userId);
      setFlags(flags);
    }
    setLoading(false);
  };

  const hasFeature = (featureName) => {
    return flags.subscription?.[featureName] || flags.global?.[featureName] || false;
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, hasFeature, loading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagContext);
```

### A/B Testing Implementation

```javascript
// hooks/useABTest.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useABTest = (testName, variants) => {
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    const userId = supabase.auth.user()?.id;
    if (!userId) return;

    // Consistent hashing for user assignment
    const hash = hashCode(userId + testName);
    const variantIndex = Math.abs(hash) % variants.length;
    const selectedVariant = variants[variantIndex];
    
    setVariant(selectedVariant);

    // Track experiment participation
    supabase.from('ab_test_participants').insert({
      user_id: userId,
      test_name: testName,
      variant: selectedVariant,
      enrolled_at: new Date()
    });
  }, [testName, variants]);

  return variant;
};

// Usage example
const MatchingInterface = () => {
  const variant = useABTest('matching-ui', ['swipe', 'grid']);

  if (variant === 'swipe') {
    return <SwipeInterface />;
  } else if (variant === 'grid') {
    return <GridInterface />;
  }

  return null;
};
```

## 7. Real-time Features için Supabase Realtime Kullanımı

### Real-time Chat Implementation

```javascript
// services/chatService.js
export class ChatService {
  static subscribeToMessages(matchId, onMessage) {
    return supabase
      .channel(`chat:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      }, payload => {
        onMessage(payload.new);
      })
      .subscribe();
  }

  static async sendMessage(matchId, content, type = 'text') {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: supabase.auth.user().id,
        content,
        message_type: type,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async markAsRead(messageIds) {
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date() })
      .in('id', messageIds)
      .neq('sender_id', supabase.auth.user().id);
  }
}

// Chat Component
const ChatRoom = ({ match }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load existing messages
    loadMessages();

    // Subscribe to new messages
    const subscription = ChatService.subscribeToMessages(match.id, (message) => {
      setMessages(prev => [...prev, message]);
      
      // Auto-scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${match.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        const otherUserTyping = Object.keys(state).some(
          key => state[key][0].user_id !== supabase.auth.user().id
        );
        setTyping(otherUserTyping);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      typingChannel.unsubscribe();
    };
  }, [match.id]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', match.id)
      .order('created_at', { ascending: true });
    
    setMessages(data || []);
    
    // Mark messages as read
    const unreadIds = data
      ?.filter(m => !m.is_read && m.sender_id !== supabase.auth.user().id)
      .map(m => m.id);
    
    if (unreadIds?.length > 0) {
      ChatService.markAsRead(unreadIds);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await ChatService.sendMessage(match.id, newMessage);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = async () => {
    const typingChannel = supabase.channel(`typing:${match.id}`);
    await typingChannel.track({
      user_id: supabase.auth.user().id,
      typing: true
    });
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} isOwn={msg.sender_id === supabase.auth.user().id} />
        ))}
        {typing && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            handleTyping();
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

### Real-time Notifications

```javascript
// services/notificationService.js
export class NotificationService {
  static async requestPermission() {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM token
      const token = await getMessaging().getToken({
        vapidKey: import.meta.env.VITE_FCM_VAPID_KEY
      });
      
      // Save token to database
      await supabase
        .from('notification_tokens')
        .upsert({
          user_id: supabase.auth.user().id,
          token,
          platform: 'web'
        });
    }
    
    return permission;
  }

  static subscribeToNotifications(userId) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => {
        this.showNotification(payload.new);
      })
      .subscribe();
  }

  static showNotification(notification) {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: notification.type,
        data: notification.data
      });
    }
    
    // Also show in-app notification
    toast.info(
      <div onClick={() => this.handleNotificationClick(notification)}>
        <strong>{notification.title}</strong>
        <p>{notification.body}</p>
      </div>
    );
  }

  static handleNotificationClick(notification) {
    switch (notification.type) {
      case 'new_match':
        navigate(`/matches/${notification.data.match_id}`);
        break;
      case 'new_message':
        navigate(`/chat/${notification.data.match_id}`);
        break;
      case 'new_like':
        navigate('/likes');
        break;
    }
  }
}
```

## 8. Önerilen Mimari Yapı ve Klasör Organizasyonu

```
src/
├── components/               # Reusable UI components
│   ├── common/              # Buttons, Inputs, Cards
│   ├── layout/              # Header, Footer, Navigation
│   └── features/            # Feature-specific components
├── features/                # Feature modules
│   ├── auth/               # Authentication
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── profile/            # User profiles
│   ├── discovery/          # Matching & discovery
│   ├── chat/              # Messaging
│   ├── subscription/       # Payment & subscriptions
│   └── settings/          # User settings
├── hooks/                  # Custom React hooks
├── services/              # Business logic & API calls
├── lib/                   # External library configs
├── utils/                 # Helper functions
├── styles/                # Global styles
├── types/                 # TypeScript definitions
└── tests/                 # Test files
```

### Modül Bazlı Yaklaşım

```javascript
// features/discovery/index.js
export { DiscoveryPage } from './pages/DiscoveryPage';
export { SwipeCard } from './components/SwipeCard';
export { useDiscovery } from './hooks/useDiscovery';
export { DiscoveryService } from './services/DiscoveryService';

// features/discovery/services/DiscoveryService.js
export class DiscoveryService {
  static async getProfiles(filters) {
    const { data } = await supabase.rpc('get_discovery_profiles', {
      user_id: supabase.auth.user().id,
      filters
    });
    return data;
  }

  static async swipeProfile(targetId, action) {
    const { data } = await supabase.rpc('process_swipe', {
      actor_id: supabase.auth.user().id,
      target_id: targetId,
      action
    });
    
    if (data.is_match) {
      NotificationService.showNotification({
        title: 'New Match! 🎉',
        body: `You matched with ${data.match_name}!`
      });
    }
    
    return data;
  }
}
```

## 9. MVP'den Tam Ürüne Geliştirme Sırası

### Phase 1: Core MVP (1-3 ay)
```javascript
// MVP Features
const MVP_FEATURES = {
  auth: {
    signup: true,
    login: true,
    passwordReset: true
  },
  profile: {
    basicInfo: true,
    photoUpload: true, // max 3 photos
    simplePreferences: true
  },
  discovery: {
    basicSwipe: true,
    simpleFilters: true // age, distance
  },
  matching: {
    basicLikes: true,
    mutualMatch: true
  },
  chat: {
    textMessages: true,
    matchList: true
  }
};

// MVP Database Schema (simplified)
CREATE TABLE users_mvp (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  age INTEGER,
  bio TEXT,
  photo_url TEXT,
  location POINT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE likes_mvp (
  id UUID PRIMARY KEY,
  liker_id UUID REFERENCES users_mvp(id),
  liked_id UUID REFERENCES users_mvp(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);
```

### Phase 2: Enhanced Features (4-6 ay)
```javascript
// Enhanced Features
const PHASE_2_FEATURES = {
  profile: {
    multiplePhotos: true, // up to 6
    detailedInfo: true,
    interests: true,
    photoVerification: true
  },
  discovery: {
    advancedFilters: true,
    superLikes: true,
    rewind: true
  },
  social: {
    instagramIntegration: true,
    spotifyIntegration: true
  },
  safety: {
    reportSystem: true,
    blockSystem: true,
    photoModeration: true
  },
  notifications: {
    pushNotifications: true,
    emailNotifications: true
  }
};
```

### Phase 3: Monetization (7-9 ay)
```javascript
// Monetization Features
const PHASE_3_FEATURES = {
  subscriptions: {
    tieredPlans: true,
    stripeIntegration: true,
    gracePeriods: true
  },
  premiumFeatures: {
    unlimitedLikes: true,
    seeWhoLikesYou: true,
    boosts: true,
    advancedFilters: true
  },
  analytics: {
    profileViews: true,
    matchInsights: true
  }
};
```

### Phase 4: Advanced Features (10-12 ay)
```javascript
// Advanced Features
const PHASE_4_FEATURES = {
  communication: {
    voiceCalls: true,
    videoCalls: true,
    voiceMessages: true,
    gifs: true
  },
  ai: {
    smartMatching: true,
    conversationStarters: true,
    profileOptimization: true
  },
  global: {
    passport: true,
    translation: true,
    multiCurrency: true
  },
  social: {
    groupEvents: true,
    friendsMode: true
  }
};
```

## 10. Best Practices ve Security Considerations

### Security Best Practices

```javascript
// 1. Input Validation
const validateProfile = (data) => {
  const schema = z.object({
    name: z.string().min(2).max(50),
    age: z.number().min(18).max(100),
    bio: z.string().max(500).optional(),
    email: z.string().email()
  });
  
  return schema.parse(data);
};

// 2. Rate Limiting
const rateLimiter = new Map();

export const checkRateLimit = (userId, action, limit = 100) => {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  const requests = rateLimiter.get(key) || [];
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimiter.set(key, [...recentRequests, now]);
  return true;
};

// 3. Content Security Policy
export const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co https://api.stripe.com;
  `.replace(/\n/g, ''),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// 4. Data Encryption
export const encryptSensitiveData = async (data) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );
  
  return { encrypted, iv, key };
};

// 5. Image Security
export const validateAndProcessImage = async (file) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large');
  }
  
  // Scan for malicious content
  const isSafe = await scanImage(file);
  if (!isSafe) {
    throw new Error('Image contains inappropriate content');
  }
  
  // Compress and optimize
  const optimized = await compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8
  });
  
  return optimized;
};
```

### Performance Optimization

```javascript
// 1. Code Splitting
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

// 2. Memoization
const ProfileCard = memo(({ profile, onLike, onPass }) => {
  const compatibility = useMemo(() => 
    calculateCompatibility(currentUser, profile), 
    [currentUser, profile]
  );
  
  return (
    <div className="profile-card">
      {/* Card content */}
    </div>
  );
});

// 3. Virtual Scrolling
import { FixedSizeList } from 'react-window';

const MessageList = ({ messages }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <Message message={messages[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};

// 4. Debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// 5. Caching Strategy
const useCachedProfiles = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: () => DiscoveryService.getProfiles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};
```

### Error Handling

```javascript
// Global Error Boundary
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    Sentry.captureException(error, {
      contexts: { react: errorInfo }
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h2>Oops! Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// API Error Handling
const apiClient = {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new APIError(error.message, response.status);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network error
      throw new NetworkError('Network request failed');
    }
  }
};
```

Bu kapsamlı rehber, Vite + React + Supabase stack'i kullanarak modern bir dating uygulaması geliştirmek için gereken tüm teknik detayları içermektedir. Güvenlik, performans ve ölçeklenebilirlik göz önünde bulundurularak hazırlanmıştır.