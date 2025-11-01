import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const TestServiceRole = () => {
  const { t } = useLanguage();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testServiceRole = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-service-role');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : String(error) });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{t('testServiceRole.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testServiceRole}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? t('testServiceRole.testing') : t('testServiceRole.button')}
            </Button>

            {result && (
              <pre className="bg-gray-900 p-4 rounded text-gray-100 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestServiceRole;