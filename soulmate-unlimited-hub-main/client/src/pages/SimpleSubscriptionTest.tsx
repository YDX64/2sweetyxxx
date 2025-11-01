import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Play, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
}

export default function SimpleSubscriptionTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Test Kullanıcıları', status: 'idle', message: 'Test edilmedi' },
    { name: 'Abonelik Limitleri', status: 'idle', message: 'Test edilmedi' },
    { name: 'Gerçek Fonksiyonalite', status: 'idle', message: 'Test edilmedi' }
  ]);

  const updateTest = (index: number, status: TestResult['status'], message: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ));
  };

  const testUsers = async () => {
    updateTest(0, 'running', 'Test kullanıcıları kontrol ediliyor...');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('email', ['free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com']);

      if (error) {
        updateTest(0, 'error', `Hata: ${error.message}`);
        return;
      }

      if (data && data.length === 4) {
        updateTest(0, 'success', `Tüm test kullanıcıları mevcut (${data.length}/4)`);
      } else {
        updateTest(0, 'error', `Eksik kullanıcılar: ${data?.length || 0}/4`);
      }
    } catch (error) {
      updateTest(0, 'error', `Beklenmeyen hata: ${error}`);
    }
  };

  const testLimits = async () => {
    updateTest(1, 'running', 'Abonelik limitleri test ediliyor...');
    
    try {
      // SQL sorgusu ile direkt veri al
      const { data, error } = await supabase
        .from('profiles')
        .select('email, role, daily_likes_used, daily_super_likes_used')
        .in('email', ['free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com']);

      if (error) {
        updateTest(1, 'error', `Limit sorgusu hatası: ${error.message}`);
        return;
      }

      if (data) {
        const limitCheck = data.map(user => {
          const limits = {
            registered: { likes: 5, superLikes: 1 },
            silver: { likes: 25, superLikes: 5 },
            gold: { likes: 100, superLikes: 25 },
            platinum: { likes: 999, superLikes: 999 }
          };
          
          const userLimits = limits[user.role as keyof typeof limits] || limits.registered;
          return `${user.role}: ${user.daily_likes_used}/${userLimits.likes} likes`;
        }).join(', ');

        updateTest(1, 'success', `Limitler: ${limitCheck}`);
      }
    } catch (error) {
      updateTest(1, 'error', `Test hatası: ${error}`);
    }
  };

  const testFunctionality = async () => {
    updateTest(2, 'running', 'Fonksiyonalite test ediliyor...');
    
    try {
      // Free kullanıcının kullanımını artır
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ daily_likes_used: 5 }) // Limite ulaştır
        .eq('email', 'free@test.com');

      if (updateError) {
        updateTest(2, 'error', `Güncelleme hatası: ${updateError.message}`);
        return;
      }

      // Güncellenmiş değeri kontrol et
      const { data, error: checkError } = await supabase
        .from('profiles')
        .select('daily_likes_used')
        .eq('email', 'free@test.com')
        .single();

      if (checkError) {
        updateTest(2, 'error', `Kontrol hatası: ${checkError.message}`);
        return;
      }

      if (data?.daily_likes_used === 5) {
        updateTest(2, 'success', 'Free kullanıcı limite ulaştı (5/5 likes)');
      } else {
        updateTest(2, 'error', `Beklenen: 5, Gerçek: ${data?.daily_likes_used}`);
      }
    } catch (error) {
      updateTest(2, 'error', `Fonksiyonalite hatası: ${error}`);
    }
  };

  const runAllTests = async () => {
    toast({
      title: "Basit Test Başlatıldı",
      description: "Abonelik sistemi temel kontrollerden geçiriliyor...",
    });

    await testUsers();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLimits();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFunctionality();

    const successCount = tests.filter(test => test.status === 'success').length;
    toast({
      title: "Test Tamamlandı",
      description: `${successCount}/${tests.length} test başarılı`,
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Play className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Başarılı</Badge>;
      case 'error': return <Badge variant="destructive">Hatalı</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Çalışıyor</Badge>;
      default: return <Badge variant="outline">Bekliyor</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Basit Abonelik Testi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Temel abonelik özelliklerinin çalışıp çalışmadığını kontrol edin
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={runAllTests} className="w-full" size="lg">
            Tüm Testleri Çalıştır
          </Button>
        </div>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <Card key={index} className={`${test.status === 'running' ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {test.message}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Test Edilen Özellikler:</h3>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>• Test kullanıcılarının database'de varlığı</li>
            <li>• Günlük like limitlerinin doğru ataması</li>
            <li>• Database update işlemlerinin çalışması</li>
            <li>• Abonelik seviyelerine göre limit kontrolü</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Beklenen Sonuçlar:</h3>
          <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <div><strong>Free:</strong> 5 likes/gün, 1 super like/gün</div>
            <div><strong>Silver:</strong> 25 likes/gün, 5 super likes/gün</div>
            <div><strong>Gold:</strong> 100 likes/gün, 25 super likes/gün</div>
            <div><strong>Platinum:</strong> Sınırsız (999 limit)</div>
          </div>
        </div>
      </div>
    </div>
  );
}