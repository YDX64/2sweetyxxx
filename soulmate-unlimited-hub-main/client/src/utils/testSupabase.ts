import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', { session, sessionError });
    
    // Test 2: Try a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    console.log('Profile query test:', { data, error });
    
    // Test 3: Check auth state
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', { user, userError });
    
    return {
      connectionOk: !error,
      sessionOk: !sessionError,
      userOk: !userError,
      details: { session, user, profileTest: data }
    };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return {
      connectionOk: false,
      sessionOk: false,
      userOk: false,
      error
    };
  }
}

// Extend Window interface for debugging
declare global {
  interface Window {
    testSupabase?: typeof testSupabaseConnection;
  }
}

// Auto-run on import for debugging
if (typeof window !== 'undefined') {
  window.testSupabase = testSupabaseConnection;
  console.log('Run window.testSupabase() in console to test Supabase connection');
}