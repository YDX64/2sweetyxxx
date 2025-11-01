# FEATURE_FLAGS.md - Feature Gating & Subscription System

## Subscription Tier Hierarchy

```
registered (Free) → silver → gold → platinum
                            ↓
                        moderator → admin
```

## Feature Matrix

| Feature | Registered | Silver | Gold | Platinum | Admin/Mod |
|---------|------------|---------|-------|----------|-----------|
| **Daily Swipes** | 10 | 50 | 100 | Unlimited | Unlimited |
| **Daily Likes** | 5 | 25 | 50 | Unlimited | Unlimited |
| **Super Likes** | 0 | 1 | 5 | 10 | Unlimited |
| **See Who Likes You** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Message Anyone** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Advanced Filters** | ❌ | Basic | ✅ | ✅ | ✅ |
| **Read Receipts** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Incognito Mode** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Profile Boost** | ❌ | 1/month | 1/week | 1/day | Unlimited |
| **Rewind Last Swipe** | ❌ | 3/day | 10/day | Unlimited | Unlimited |
| **Priority Support** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Ad-Free** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Video Calls** | ❌ | 15 min | 60 min | Unlimited | Unlimited |
| **Profile Views** | ❌ | Last 10 | Last 25 | All | All |
| **Travel Mode** | ❌ | ❌ | ✅ | ✅ | ✅ |

## Implementation Guide

### 1. Basic Feature Gate Check

```typescript
// client/src/hooks/useFeatureGate.tsx
export const useFeatureGate = () => {
  const { profile } = useAuth();
  
  const checkFeature = (feature: string): boolean => {
    const tier = profile?.subscription_tier || 'registered';
    
    switch (feature) {
      case 'see_who_likes':
        return ['gold', 'platinum', 'admin', 'moderator'].includes(tier);
      
      case 'unlimited_swipes':
        return ['platinum', 'admin', 'moderator'].includes(tier);
        
      case 'advanced_filters':
        return ['silver', 'gold', 'platinum', 'admin', 'moderator'].includes(tier);
        
      case 'profile_boost':
        return tier !== 'registered';
        
      default:
        return false;
    }
  };
  
  return { checkFeature };
};
```

### 2. Feature-Specific Implementations

#### A. Daily Limits System

```typescript
// client/src/services/subscriptionLimits.ts
export const DAILY_LIMITS = {
  registered: {
    swipes: 10,
    likes: 5,
    super_likes: 0,
    rewinds: 0,
    boosts: 0
  },
  silver: {
    swipes: 50,
    likes: 25,
    super_likes: 1,
    rewinds: 3,
    boosts: 0.033 // 1 per month ÷ 30
  },
  gold: {
    swipes: 100,
    likes: 50,
    super_likes: 5,
    rewinds: 10,
    boosts: 0.143 // 1 per week ÷ 7
  },
  platinum: {
    swipes: Infinity,
    likes: Infinity,
    super_likes: 10,
    rewinds: Infinity,
    boosts: 1 // 1 per day
  }
};

// Usage tracking
export const checkDailyLimit = async (
  userId: string,
  limitType: keyof typeof DAILY_LIMITS.registered
) => {
  const { data: usage } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', new Date().toISOString().split('T')[0])
    .single();
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();
    
  const tier = profile?.subscription_tier || 'registered';
  const limit = DAILY_LIMITS[tier][limitType];
  const used = usage?.[`${limitType}_used`] || 0;
  
  return {
    allowed: limit,
    used,
    remaining: limit === Infinity ? Infinity : Math.max(0, limit - used),
    canUse: limit === Infinity ? true : used < limit
  };
};
```

#### B. See Who Likes You

```typescript
// client/src/components/likes/WhoLikesYou.tsx
export const WhoLikesYou = () => {
  const { checkFeature } = useFeatureGate();
  const canSeeWhoLikes = checkFeature('see_who_likes');
  
  if (!canSeeWhoLikes) {
    return (
      <div className="blur-md relative">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Card className="p-6 bg-white/90 dark:bg-gray-800/90">
            <h3 className="text-lg font-semibold mb-2">
              Upgrade to See Who Likes You
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Gold and Platinum members can see everyone who likes them
            </p>
            <Button onClick={() => navigate('/upgrades')}>
              Upgrade Now
            </Button>
          </Card>
        </div>
        {/* Blurred placeholder content */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  // Show actual likes for gold+ users
  return <LikesList />;
};
```

#### C. Profile Boost

```typescript
// client/src/services/boostService.ts
export const activateBoost = async (userId: string, boostType: 'profile' | 'super_boost') => {
  // Check if user can boost
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();
    
  const tier = profile?.subscription_tier || 'registered';
  
  // Check boost availability
  const canBoost = await checkBoostAvailability(userId, tier);
  if (!canBoost.available) {
    throw new Error(canBoost.reason);
  }
  
  // Activate boost
  const duration = boostType === 'super_boost' ? 60 : 30; // minutes
  const { data, error } = await supabase
    .from('profile_boosts')
    .insert({
      user_id: userId,
      boost_type: boostType,
      duration_minutes: duration,
      started_at: new Date(),
      ends_at: new Date(Date.now() + duration * 60 * 1000)
    });
    
  if (error) throw error;
  
  // Update profile
  await supabase
    .from('profiles')
    .update({ is_boosted: true })
    .eq('id', userId);
    
  return data;
};

const checkBoostAvailability = async (userId: string, tier: string) => {
  if (tier === 'registered') {
    return { available: false, reason: 'Boost requires Silver or higher' };
  }
  
  // Check last boost time
  const { data: lastBoost } = await supabase
    .from('profile_boosts')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (!lastBoost) {
    return { available: true };
  }
  
  const timeSinceLastBoost = Date.now() - new Date(lastBoost.created_at).getTime();
  const requiredInterval = {
    silver: 30 * 24 * 60 * 60 * 1000, // 30 days
    gold: 7 * 24 * 60 * 60 * 1000,    // 7 days
    platinum: 24 * 60 * 60 * 1000     // 1 day
  }[tier];
  
  if (timeSinceLastBoost < requiredInterval) {
    const nextAvailable = new Date(new Date(lastBoost.created_at).getTime() + requiredInterval);
    return { 
      available: false, 
      reason: `Next boost available ${nextAvailable.toLocaleDateString()}`
    };
  }
  
  return { available: true };
};
```

#### D. Advanced Filters

```typescript
// client/src/components/DiscoveryFilters.tsx
export const DiscoveryFilters = () => {
  const { checkFeature } = useFeatureGate();
  const tier = useProfile()?.subscription_tier || 'registered';
  
  // Basic filters for all
  const [ageRange, setAgeRange] = useState([18, 99]);
  const [distance, setDistance] = useState(50);
  
  // Advanced filters
  const hasAdvancedFilters = checkFeature('advanced_filters');
  const [education, setEducation] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [height, setHeight] = useState<[number, number]>([150, 220]);
  const [hasKids, setHasKids] = useState<boolean | null>(null);
  
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Discovery Filters</h3>
      
      {/* Basic Filters - All Users */}
      <div className="space-y-4">
        <div>
          <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
          <Slider
            value={ageRange}
            onValueChange={setAgeRange}
            min={18}
            max={99}
            step={1}
          />
        </div>
        
        <div>
          <Label>Distance: {distance} miles</Label>
          <Slider
            value={[distance]}
            onValueChange={([v]) => setDistance(v)}
            min={1}
            max={100}
            step={1}
          />
        </div>
      </div>
      
      {/* Advanced Filters - Silver+ */}
      {hasAdvancedFilters ? (
        <div className="mt-6 pt-6 border-t space-y-4">
          <h4 className="font-medium text-sm text-gray-600">Advanced Filters</h4>
          
          {tier === 'silver' && (
            <Alert>
              <AlertDescription>
                Upgrade to Gold for all advanced filters
              </AlertDescription>
            </Alert>
          )}
          
          {/* Silver gets 2 advanced filters */}
          {(tier === 'silver' || tier === 'gold' || tier === 'platinum') && (
            <>
              <div>
                <Label>Education Level</Label>
                <Select
                  multiple
                  value={education}
                  onValueChange={setEducation}
                >
                  <SelectOption value="high_school">High School</SelectOption>
                  <SelectOption value="bachelors">Bachelor's</SelectOption>
                  <SelectOption value="masters">Master's</SelectOption>
                  <SelectOption value="phd">PhD</SelectOption>
                </Select>
              </div>
              
              <div>
                <Label>Interests</Label>
                <InterestPicker
                  selected={interests}
                  onChange={setInterests}
                  max={tier === 'silver' ? 3 : 10}
                />
              </div>
            </>
          )}
          
          {/* Gold+ gets all filters */}
          {(tier === 'gold' || tier === 'platinum') && (
            <>
              <div>
                <Label>Height Range (cm)</Label>
                <RangeSlider
                  value={height}
                  onValueChange={setHeight}
                  min={150}
                  max={220}
                />
              </div>
              
              <div>
                <Label>Has Children</Label>
                <RadioGroup value={hasKids} onValueChange={setHasKids}>
                  <RadioItem value={null}>No Preference</RadioItem>
                  <RadioItem value={true}>Yes</RadioItem>
                  <RadioItem value={false}>No</RadioItem>
                </RadioGroup>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 pt-6 border-t">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <h4 className="font-medium mb-2">Unlock Advanced Filters</h4>
            <p className="text-sm text-gray-600 mb-3">
              Filter by education, interests, height, and more
            </p>
            <Button 
              size="sm" 
              onClick={() => navigate('/upgrades')}
              className="w-full"
            >
              Upgrade to Silver
            </Button>
          </Card>
        </div>
      )}
    </Card>
  );
};
```

### 3. Admin/Moderator Features

```typescript
// client/src/services/roleService.ts
export const checkAdminFeature = (feature: string, role: string): boolean => {
  const adminFeatures = [
    'view_all_users',
    'edit_any_profile', 
    'manage_subscriptions',
    'view_analytics',
    'system_settings'
  ];
  
  const moderatorFeatures = [
    'review_reports',
    'ban_users',
    'approve_photos',
    'moderate_content'
  ];
  
  if (role === 'admin') return true; // Admins can do everything
  
  if (role === 'moderator') {
    return moderatorFeatures.includes(feature) || 
           feature.startsWith('moderate_');
  }
  
  return false;
};
```

### 4. Feature Flag Testing

```typescript
// Test different subscription tiers
const testFeatureAccess = async (userId: string) => {
  const tiers = ['registered', 'silver', 'gold', 'platinum'];
  const features = [
    'see_who_likes',
    'unlimited_swipes',
    'advanced_filters',
    'profile_boost',
    'video_calls'
  ];
  
  for (const tier of tiers) {
    // Temporarily set tier
    await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', userId);
      
    console.log(`\n=== ${tier.toUpperCase()} ===`);
    
    for (const feature of features) {
      const hasAccess = checkFeature(feature);
      console.log(`${feature}: ${hasAccess ? '✅' : '❌'}`);
    }
  }
};
```

## Environment-Based Feature Flags

```typescript
// .env configuration
ENABLE_VIDEO_CALLS=true
ENABLE_VOICE_MESSAGES=false
ENABLE_LIVE_STREAMING=false
ENABLE_GROUP_CHATS=false

// Usage
const isFeatureEnabled = (feature: string): boolean => {
  return process.env[`ENABLE_${feature.toUpperCase()}`] === 'true';
};
```

## A/B Testing Framework

```typescript
// Simple A/B test implementation
export const useABTest = (testName: string, variants: string[]) => {
  const userId = useAuth().user?.id;
  
  const getVariant = () => {
    if (!userId) return variants[0];
    
    // Consistent variant assignment based on user ID
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const index = Math.abs(hash) % variants.length;
    return variants[index];
  };
  
  const variant = getVariant();
  
  // Track exposure
  useEffect(() => {
    trackEvent('ab_test_exposure', {
      test: testName,
      variant,
      userId
    });
  }, [testName, variant, userId]);
  
  return variant;
};

// Usage
const MessageButton = () => {
  const buttonText = useABTest('message_button_text', [
    'Send Message',
    'Start Chat',
    'Say Hello'
  ]);
  
  return <Button>{buttonText}</Button>;
};
```

## Feature Rollout Strategy

### Progressive Rollout
```typescript
// Percentage-based rollout
const isFeatureRolledOut = (feature: string, userId: string): boolean => {
  const rolloutPercentages = {
    'new_matching_algorithm': 10,  // 10% of users
    'video_profiles': 25,          // 25% of users
    'ai_suggestions': 50           // 50% of users
  };
  
  const percentage = rolloutPercentages[feature] || 0;
  if (percentage === 0) return false;
  if (percentage === 100) return true;
  
  // Consistent assignment based on user ID
  const hash = hashCode(userId + feature);
  return (hash % 100) < percentage;
};
```

### Tier-Based Rollout
```typescript
// Roll out to higher tiers first
const tierRollout = {
  'new_feature_x': ['platinum', 'admin'], // Start with platinum
  'new_feature_y': ['gold', 'platinum', 'admin'], // Then add gold
  'new_feature_z': ['silver', 'gold', 'platinum', 'admin'] // Then silver
};
```