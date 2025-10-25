import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugProfiles() {
  const { user, session } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // 1. Check session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      info.session = {
        exists: !!currentSession,
        error: sessionError,
        userId: currentSession?.user?.id,
        email: currentSession?.user?.email,
        expiresAt: currentSession?.expires_at,
        accessToken: currentSession?.access_token ? 'present' : 'missing'
      };

      // 2. Check user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      info.user = {
        exists: !!currentUser,
        error: userError,
        id: currentUser?.id,
        email: currentUser?.email
      };

      // 3. Direct profile query
      if (currentUser) {
        console.log('Attempting direct profile query for user:', currentUser.id);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        info.profileQuery = {
          data: profile,
          error: profileError,
          hasData: !!profile
        };

        // 4. Check RLS status
        const { data: rlsCheck, error: rlsError } = await supabase
          .rpc('current_setting', { setting_name: 'row_security_enforced' });
        
        info.rlsStatus = {
          enabled: rlsCheck,
          error: rlsError
        };

        // 5. Test profile access with different methods
        const { count: profileCount, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('id', currentUser.id);

        info.profileCount = {
          count: profileCount,
          error: countError
        };

        // 6. Check if we can see any profiles at all
        const { data: anyProfiles, error: anyError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        info.anyProfiles = {
          found: anyProfiles?.length || 0,
          error: anyError
        };

        // 7. Network connectivity check
        try {
          const response = await fetch('https://kvrlzpdyeezmhjiiwfnp.supabase.co/rest/v1/', {
            method: 'HEAD'
          });
          info.network = {
            status: response.status,
            ok: response.ok
          };
        } catch (netError) {
          info.network = {
            error: netError instanceof Error ? netError.message : String(netError)
          };
        }
      }

      // 8. Check localStorage
      info.localStorage = {
        hasSupabaseAuth: !!localStorage.getItem('supabase.auth.token'),
        keys: Object.keys(localStorage).filter(k => k.includes('supabase'))
      };

    } catch (error) {
      info.generalError = error;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Loading Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? 'Running...' : 'Run Diagnostics'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Check the browser console for additional logs.</p>
            <p>Look for errors in the Network tab (F12 → Network).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}