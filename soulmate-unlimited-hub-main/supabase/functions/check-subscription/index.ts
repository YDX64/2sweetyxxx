import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Invalid token or user not found');
    }

    console.log('🔍 Checking subscription for user:', user.id);

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError);
      throw new Error('Profile not found');
    }

    console.log('📋 Profile data:', profile);

    // Get subscriber data
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('💳 Subscriber data:', subscriber);

    // Determine subscription status
    let subscriptionTier = profile.role || 'registered';
    let subscribed = false;
    let subscriptionEnd = null;
    let source = 'profiles';

    // Check if has active subscription in subscribers table
    if (subscriber && subscriber.subscribed) {
      subscriptionTier = subscriber.subscription_tier || subscriptionTier;
      subscribed = true;
      subscriptionEnd = subscriber.subscription_end;
      source = 'subscribers';
      
      // Check if subscription is still valid
      if (subscriptionEnd) {
        const endDate = new Date(subscriptionEnd);
        const now = new Date();
        if (endDate <= now) {
          subscribed = false;
          subscriptionTier = 'registered';
          source = 'expired';
        }
      }
    } else if (profile.role && ['silver', 'gold', 'platinum', 'admin', 'moderator'].includes(profile.role)) {
      // Has premium role in profiles
      subscribed = true;
      subscriptionTier = profile.role;
      source = 'profiles_role';
    }

    const result = {
      subscription_tier: subscriptionTier,
      subscribed: subscribed,
      subscription_end: subscriptionEnd,
      source: source,
      user_id: user.id,
      email: profile.email,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Subscription check result:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Check subscription error:', error);
    
    // Return default free tier on error
    const defaultResult = {
      subscription_tier: 'registered',
      subscribed: false,
      subscription_end: null,
      source: 'error',
      error: error.message
    };

    return new Response(
      JSON.stringify(defaultResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to avoid frontend errors
      }
    );
  }
});