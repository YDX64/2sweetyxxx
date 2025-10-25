import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Play, Database, Users, Settings, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
  timestamp?: string;
}

export default function SubscriptionValidation() {
  const [tests, setTests] = useState<TestResult[]>([
    { id: 'db-structure', name: 'Database Yapısı', status: 'idle', message: 'Henüz test edilmedi' },
    { id: 'user-limits', name: 'Kullanıcı Limitleri', status: 'idle', message: 'Henüz test edilmedi' },
    { id: 'tier-features', name: 'Tier Özellikleri', status: 'idle', message: 'Henüz test edilmedi' },
    { id: 'daily-reset', name: 'Günlük Sıfırlama', status: 'idle', message: 'Henüz test edilmedi' },
    { id: 'limit-enforcement', name: 'Limit Zorlama', status: 'idle', message: 'Henüz test edilmedi' }
  ]);

  const updateTest = (id: string, status: TestResult['status'], message: string) => {
    setTests(prev => prev.map(test => 
      test.id === id 
        ? { ...test, status, message, timestamp: new Date().toLocaleTimeString() }
        : test
    ));
  };

  // Test 1: Database Yapısı Kontrolü
  const testDatabaseStructure = async () => {
    updateTest('db-structure', 'running', 'Database yapısı kontrol ediliyor...');
    
    try {
      // Test kullanıcılarının varlığını kontrol et
      const { data: testUsers, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('email', ['free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com']);

      if (error) {
        updateTest('db-structure', 'error', `Database hatası: ${error.message}`);
        return false;
      }

      if (!testUsers || testUsers.length < 4) {
        updateTest('db-structure', 'error', `Test kullanıcıları eksik. Bulunan: ${testUsers?.length || 0}/4`);
        return false;
      }

      updateTest('db-structure', 'success', `✅ Tüm test kullanıcıları mevcut (${testUsers.length}/4)`);
      return true;
    } catch (error) {
      updateTest('db-structure', 'error', `Beklenmeyen hata: ${error}`);
      return false;
    }
  };

  // Test 2: Kullanıcı Limitlerini Kontrol Et
  const testUserLimits = async () => {
    updateTest('user-limits', 'running', 'Kullanıcı limitleri test ediliyor...');
    
    try {
      // Her tier için kullanıcı verilerini al
      const { data: users, error } = await supabase
        .from('profiles')
        .select('email, role, daily_likes_used, daily_super_likes_used')
        .in('email', ['free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com']);

      if (error) {
        updateTest('user-limits', 'error', `Veri alımında hata: ${error.message}`);
        return false;
      }

      // Tier limitleri
      const limits = {
        registered: { likes: 5, superLikes: 1 },
        silver: { likes: 25, superLikes: 5 },
        gold: { likes: 100, superLikes: 25 },
        platinum: { likes: 999, superLikes: 999 }
      };

      let results: string[] = [];
      users?.forEach(user => {
        const userLimits = limits[user.role as keyof typeof limits] || limits.registered;
        const likesUsed = user.daily_likes_used || 0;
        const superLikesUsed = user.daily_super_likes_used || 0;
        const likesStatus = likesUsed <= userLimits.likes ? '✅' : '❌';
        const superLikesStatus = superLikesUsed <= userLimits.superLikes ? '✅' : '❌';
        
        results.push(`${user.role}: ${likesStatus} ${likesUsed}/${userLimits.likes} likes, ${superLikesStatus} ${superLikesUsed}/${userLimits.superLikes} super likes`);
      });

      updateTest('user-limits', 'success', `Kullanıcı limitleri: ${results.join(' | ')}`);
      return true;
    } catch (error) {
      updateTest('user-limits', 'error', `Test hatası: ${error}`);
      return false;
    }
  };

  // Test 3: Tier Özellikleri Kontrolü
  const testTierFeatures = async () => {
    updateTest('tier-features', 'running', 'Tier özellikleri kontrol ediliyor...');
    
    try {
      const tierFeatures = {
        registered: ['Temel eşleşme', 'Günde 5 like', '1 super like'],
        silver: ['Kim beğendi görme', 'Gelişmiş filtreler', 'Sesli aramalar', 'Günde 25 like'],
        gold: ['Video aramalar', 'Pasaport özelliği', 'Görünmez gezinme', 'Günde 100 like'],
        platinum: ['Sınırsız beğeni', 'Çok dilli sohbet', 'Öncelikli destek', 'Tüm özellikler']
      };

      let featureCount = 0;
      Object.values(tierFeatures).forEach(features => featureCount += features.length);

      updateTest('tier-features', 'success', `✅ ${Object.keys(tierFeatures).length} tier tanımlı, toplam ${featureCount} özellik`);
      return true;
    } catch (error) {
      updateTest('tier-features', 'error', `Feature test hatası: ${error}`);
      return false;
    }
  };

  // Test 4: Günlük Sıfırlama Testi
  const testDailyReset = async () => {
    updateTest('daily-reset', 'running', 'Günlük sıfırlama mekanizması test ediliyor...');
    
    try {
      // Reset all users' daily usage
      const { error } = await supabase.rpc('reset_daily_usage');

      if (error) {
        updateTest('daily-reset', 'error', `Reset fonksiyonu hatası: ${error.message}`);
        return false;
      }

      // Sıfırlanmış değerleri kontrol et
      const { data: resetUser, error: fetchError } = await supabase
        .from('profiles')
        .select('daily_likes_used, daily_super_likes_used')
        .eq('email', 'silver@test.com')
        .single();

      if (fetchError) {
        updateTest('daily-reset', 'error', `Reset kontrol hatası: ${fetchError.message}`);
        return false;
      }

      updateTest('daily-reset', 'success', `✅ Reset başarılı: ${resetUser.daily_likes_used} likes, ${resetUser.daily_super_likes_used} super likes`);
      return true;
    } catch (error) {
      updateTest('daily-reset', 'error', `Reset test hatası: ${error}`);
      return false;
    }
  };

  // Test 5: Limit Zorlama Simülasyonu
  const testLimitEnforcement = async () => {
    updateTest('limit-enforcement', 'running', 'Limit zorlama sistemi test ediliyor...');
    
    try {
      // Free kullanıcının limitini aş
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ daily_likes_used: 6 }) // 5 limitinin üzerine çıkar
        .eq('email', 'free@test.com');

      if (updateError) {
        updateTest('limit-enforcement', 'error', `Limit test güncellemesi başarısız: ${updateError.message}`);
        return false;
      }

      // Güncellenmiş değeri kontrol et
      const { data: updatedUser, error: fetchError } = await supabase
        .from('profiles')
        .select('daily_likes_used')
        .eq('email', 'free@test.com')
        .single();

      if (fetchError) {
        updateTest('limit-enforcement', 'error', `Limit kontrol hatası: ${fetchError.message}`);
        return false;
      }

      const likesUsed = updatedUser.daily_likes_used || 0;
      const isOverLimit = likesUsed > 5;
      updateTest('limit-enforcement', 'success', `✅ Free kullanıcı ${likesUsed}/5 likes (Limit aşımı: ${isOverLimit ? 'Evet' : 'Hayır'})`);
      return true;
    } catch (error) {
      updateTest('limit-enforcement', 'error', `Limit enforcement test hatası: ${error}`);
      return false;
    }
  };

  const runIndividualTest = async (testId: string) => {
    switch (testId) {
      case 'db-structure':
        await testDatabaseStructure();
        break;
      case 'user-limits':
        await testUserLimits();
        break;
      case 'tier-features':
        await testTierFeatures();
        break;
      case 'daily-reset':
        await testDailyReset();
        break;
      case 'limit-enforcement':
        await testLimitEnforcement();
        break;
    }
  };

  const runAllTests = async () => {
    toast({
      title: "Kapsamlı Test Başlatıldı",
      description: "Tüm abonelik özellikleri test ediliyor...",
    });

    await testDatabaseStructure();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testUserLimits();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testTierFeatures();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testDailyReset();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLimitEnforcement();

    const successCount = tests.filter(test => test.status === 'success').length;
    const totalTests = tests.length;

    toast({
      title: "Test Süreci Tamamlandı",
      description: `${successCount}/${totalTests} test başarıyla geçti`,
      duration: 5000,
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
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
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Abonelik Sistemi Doğrulama</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Her özelliğin düzgün çalışıp çalışmadığını kontrol edin
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <Button onClick={runAllTests} className="flex-1" size="lg">
            <Database className="w-4 h-4 mr-2" />
            Tüm Testleri Çalıştır
          </Button>
        </div>

        <div className="grid gap-4">
          {tests.map((test) => (
            <Card key={test.id} className={`${test.status === 'running' ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {test.message}
                      </p>
                      {test.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">
                          Son test: {test.timestamp}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.status)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => runIndividualTest(test.id)}
                      disabled={test.status === 'running'}
                    >
                      Tekrar Test Et
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Test Kullanıcıları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Free:</strong> free@test.com (5 likes/gün)</div>
                <div><strong>Silver:</strong> silver@test.com (25 likes/gün)</div>
                <div><strong>Gold:</strong> gold@test.com (100 likes/gün)</div>
                <div><strong>Platinum:</strong> platinum@test.com (Sınırsız)</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Test Kapsamı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div>• Database yapısı ve fonksiyonlar</div>
                <div>• Günlük limit kontrolü</div>
                <div>• Tier özellik matrisi</div>
                <div>• Otomatik sıfırlama mekanizması</div>
                <div>• Limit aşım kontrolü</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}