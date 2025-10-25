import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bug, Database } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// Modern Context7 pattern: Type-safe debug check result
interface DebugCheck {
  name: string;
  success: boolean;
  data?: unknown;
  error?: { message: string } | null;
}

// Modern Context7 pattern: Type-safe debug data structure
interface DebugData {
  user?: { id: string; email: string };
  timestamp?: string;
  checks?: DebugCheck[];
  error?: string;
  generalError?: unknown;
}

const DebugPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [debugData, setDebugData] = useState<DebugData>({});
  const [loading, setLoading] = useState(false);

  const runDebugChecks = useCallback(async () => {
    if (!user) {
      setDebugData({ error: t('debugNotLoggedIn') });
      return;
    }

    setLoading(true);
    const results: DebugData = {
      user: { id: user.id, email: user.email || '' },
      timestamp: new Date().toISOString(),
      checks: []
    };

    try {
      // 1. Profil kontrolü
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      results.checks!.push({
        name: t('debugProfileCheck'),
        success: !profileError,
        data: profile,
        error: profileError
      });

      // 2. Role alanı kontrolü  
      if (profile && typeof profile === 'object') {
        const hasRole = 'role' in profile;
        const roleValue = hasRole ? (profile as Record<string, unknown>).role : undefined;
        results.checks!.push({
          name: t('debugRoleFieldCheck'),
          success: hasRole,
          data: { hasRole, roleValue },
          error: hasRole ? null : { message: t('debugRoleFieldNotFound') }
        });
      }

      // 4. Role update testi
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id);

      results.checks!.push({
        name: t('debugUpdatePermission'),
        success: !updateError,
        error: updateError
      });

    } catch (error) {
      results.generalError = error;
    }

    setDebugData(results);
    setLoading(false);
  }, [user, t]);

  useEffect(() => {
    runDebugChecks();
  }, [runDebugChecks]);

  const createRoleColumn = async () => {
    const sql = `
      -- Role sütunu ekle
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS role text DEFAULT 'registered';
      
      -- yunusd64@gmail.com'i admin yap
      UPDATE profiles 
      SET role = 'admin' 
      WHERE email = '${user?.email}';
    `;

    alert(`Bu SQL kodunu Supabase SQL Editor'de çalıştırın:\n\n${sql}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bug className="w-6 h-6" />
              {t('debugPageTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-900/20 border-blue-700">
              <AlertDescription className="text-blue-300">
                {t('debugPageDescription')}
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={runDebugChecks}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? t('debugCheckRunning') : t('debugCheckAgain')}
              </Button>
              
              <Button
                onClick={createRoleColumn}
                className="bg-green-600 hover:bg-green-700"
              >
                <Database className="w-4 h-4 mr-2" />
                {t('debugCreateRoleColumn')}
              </Button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
              <pre className="text-xs text-gray-300">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>

            {debugData.checks && (
              <div className="space-y-2">
                <h3 className="text-white font-semibold">{t('debugResults')}:</h3>
                {debugData.checks.map((check: DebugCheck, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded ${
                      check.success
                        ? 'bg-green-900/20 border border-green-700'
                        : 'bg-red-900/20 border border-red-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{check.name}</span>
                      <span className={check.success ? 'text-green-400' : 'text-red-400'}>
                        {check.success ? t('debugSuccess') : t('debugError')}
                      </span>
                    </div>
                    {check.error && (
                      <p className="text-red-300 text-sm mt-1">
                        {check.error.message || JSON.stringify(check.error)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugPage;
