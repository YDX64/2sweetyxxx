// Tamamen Supabase tabanlı sistem
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kvrlzpdyeezmhjiiwfnp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

// Debug helper to check auth state
if (typeof window !== 'undefined') {
  (window as any).checkSupabaseAuth = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Supabase Auth State:', {
      session,
      sessionError,
      user,
      userError,
      hasSession: !!session,
      hasUser: !!user,
      accessToken: session?.access_token?.substring(0, 20) + '...'
    });
  };
  
  // Debug helper to check profile directly
  (window as any).checkProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    console.log('Checking profile for user:', user.id);
    
    // Test 1: Direct query
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    console.log('Direct profile query:', { profile, profileError });
    
    // Test 2: Count query
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('id', user.id);
      
    console.log('Profile count:', { count, countError });
    
    // Test 3: RLS test - try to see all profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id')
      .limit(5);
      
    console.log('Can see other profiles:', { 
      count: allProfiles?.length || 0, 
      error: allError 
    });
  };
  
  // Network test
  (window as any).testSupabaseConnection = async () => {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', SUPABASE_URL);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY
        }
      });
      console.log('REST API response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
    } catch (error) {
      console.error('Connection error:', error);
    }
  };
  
  // Quick RLS check
  (window as any).checkRLS = async () => {
    console.log('Checking RLS status...');
    
    const { data, error } = await supabase
      .rpc('get_rls_status');
      
    if (error) {
      console.error('Error checking RLS:', error);
      console.log('This is normal if the function does not exist');
    } else {
      console.log('RLS Status:', data);
    }
    
    // Alternative check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    console.log('Can access profiles table:', {
      canAccess: !profileError,
      error: profileError
    });
  };
  
  // Test like functionality
  (window as any).testLike = async (targetUserId?: string) => {
    console.log('Testing like functionality...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    // Use first available profile as target if not specified
    if (!targetUserId) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id)
        .limit(1);
      
      targetUserId = profiles?.[0]?.id;
      if (!targetUserId) {
        console.error('No target user found');
        return;
      }
    }
    
    console.log('Testing swipe insert for:', { userId: user.id, targetUserId });
    
    // Test direct insert
    const { data, error } = await supabase
      .from('swipes')
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        direction: 'right'
      })
      .select();
    
    console.log('Swipe insert result:', { data, error });
    
    if (error) {
      console.error('Like test failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('Like test successful!');
      
      // Clean up test data
      if (data?.[0]?.id) {
        await supabase
          .from('swipes')
          .delete()
          .eq('id', data[0].id);
        console.log('Test data cleaned up');
      }
    }
  };
  
  // Check profile and subscription data
  (window as any).checkProfileAndSubscription = async () => {
    console.log('Checking profile and subscription data...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, subscription_tier, subscription_status, subscription_expires_at')
      .eq('id', user.id)
      .single();
      
    console.log('Profile data:', { profile, profileError });
    
    // Get subscriber data
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    console.log('Subscriber data:', { subscriber, subscriberError });
    
    // Analysis
    if (profile) {
      console.log('Analysis:');
      console.log('- Role:', profile.role);
      console.log('- Subscription Tier:', profile.subscription_tier);
      console.log('- Subscription Status:', profile.subscription_status);
      console.log('- Subscription Expires At:', profile.subscription_expires_at);
      
      const isPremium = profile.subscription_tier && ['silver', 'gold', 'platinum'].includes(profile.subscription_tier);
      console.log('- Should be premium:', isPremium);
      
      if (profile.role !== profile.subscription_tier && profile.role && !['admin', 'moderator', 'registered'].includes(profile.role)) {
        console.warn('⚠️ Role and subscription_tier mismatch!');
        console.warn('Role:', profile.role);
        console.warn('Subscription Tier:', profile.subscription_tier);
      }
    }
    
    return { profile, subscriber };
  };
}
