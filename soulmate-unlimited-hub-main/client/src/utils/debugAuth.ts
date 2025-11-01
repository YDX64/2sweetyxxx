import { supabase } from "@/integrations/supabase/client";

export async function debugAuth() {
  console.log('🔍 === AUTH DEBUG START ===');
  
  // Check current session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Session error:', error);
    return;
  }
  
  if (!session) {
    console.warn('⚠️ No active session found');
    console.log('💡 Please log in first');
    return;
  }
  
  console.log('✅ Active session found');
  console.log('👤 User ID:', session.user.id);
  console.log('📧 Email:', session.user.email);
  console.log('🎫 Token (first 50 chars):', session.access_token.substring(0, 50) + '...');
  console.log('⏰ Expires at:', new Date(session.expires_at! * 1000).toLocaleString());
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at < now) {
    console.warn('⚠️ Token is expired! Refreshing...');
    const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error('❌ Failed to refresh session:', refreshError);
    } else {
      console.log('✅ Session refreshed successfully');
    }
  }
  
  // Check user role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (profileError) {
    console.error('❌ Failed to fetch user profile:', profileError);
  } else {
    console.log('👮 User role:', profile.role);
    if (profile.role !== 'admin') {
      console.warn('⚠️ User is not an admin! Current role:', profile.role);
    }
  }
  
  console.log('🔍 === AUTH DEBUG END ===');
}

// Make it available globally for testing
(window as any).debugAuth = debugAuth;