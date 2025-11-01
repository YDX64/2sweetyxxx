import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { matchingService } from "@/services/matchingService";
import { profileService } from "@/services/profileService";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TestResult {
  userProfile: Profile | null;
  testProfiles: Profile[];
  compatibilityResults: Array<{
    profile: Profile;
    isCompatible: boolean;
    reason: string;
    score: number;
    compatibilityLevel: string;
  }>;
}

export const MatchingTestPage = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runCompatibilityTest = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Kullanıcı profilini al
      const userProfile = await profileService.fetchUserProfile(user.id);
      if (!userProfile) {
        console.error("Kullanıcı profili bulunamadı");
        return;
      }

      // Test profilleri al
      const testProfiles = await profileService.fetchProfiles(user.id, {});
      
      // Her profil için uyumluluk testi yap
      const compatibilityResults = [];
      
      for (const profile of testProfiles.slice(0, 10)) { // İlk 10 profili test et
        const compatibility = matchingService.checkOrientationCompatibility(userProfile, profile);
        const scoreResult = await matchingService.calculateCompatibilityScore(
          userProfile, 
          profile, 
          userProfile.latitude && userProfile.longitude ? 
            { latitude: userProfile.latitude, longitude: userProfile.longitude } : 
            undefined
        );
        
        compatibilityResults.push({
          profile,
          isCompatible: compatibility.isCompatible,
          reason: compatibility.reason,
          score: scoreResult.score,
          compatibilityLevel: scoreResult.compatibilityLevel
        });
      }

      setTestResult({
        userProfile,
        testProfiles,
        compatibilityResults
      });
    } catch (error) {
      console.error("Test sırasında hata:", error);
    }
    setLoading(false);
  };

  const testSmartMatching = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userProfile = await profileService.fetchUserProfile(user.id);
      if (!userProfile) return;

      const smartMatches = await matchingService.getSmartMatches(
        userProfile,
        userProfile.latitude && userProfile.longitude ? 
          { latitude: userProfile.latitude, longitude: userProfile.longitude } : 
          undefined,
        {},
        10
      );

      console.log("Smart Matches:", smartMatches);
      
      // Smart matches için de uyumluluk sonuçları oluştur
      const compatibilityResults = [];
      
      for (const profile of smartMatches) {
        const compatibility = matchingService.checkOrientationCompatibility(userProfile, profile);
        const scoreResult = await matchingService.calculateCompatibilityScore(
          userProfile, 
          profile, 
          userProfile.latitude && userProfile.longitude ? 
            { latitude: userProfile.latitude, longitude: userProfile.longitude } : 
            undefined
        );
        
        compatibilityResults.push({
          profile,
          isCompatible: compatibility.isCompatible,
          reason: compatibility.reason,
          score: scoreResult.score,
          compatibilityLevel: scoreResult.compatibilityLevel
        });
      }

      setTestResult({
        userProfile,
        testProfiles: smartMatches,
        compatibilityResults
      });
    } catch (error) {
      console.error("Smart matching test sırasında hata:", error);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p>Test sayfasına erişmek için giriş yapmalısınız.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Matching Algoritması Test Sayfası</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runCompatibilityTest} 
              disabled={loading}
              variant="outline"
            >
              {loading ? "Test Ediliyor..." : "Basic Compatibility Test"}
            </Button>
            
            <Button 
              onClick={testSmartMatching} 
              disabled={loading}
              variant="default"
            >
              {loading ? "Test Ediliyor..." : "Smart Matching Test"}
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            Bu sayfa matching algoritmasının çalışıp çalışmadığını test etmek için oluşturulmuştur.
          </p>
        </CardContent>
      </Card>

      {testResult && (
        <>
          {/* Kullanıcı Profili Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Sizin Profiliniz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>İsim:</strong> {testResult.userProfile?.name || 'N/A'}
                </div>
                <div>
                  <strong>Cinsiyet:</strong> {testResult.userProfile?.gender || 'N/A'}
                </div>
                <div>
                  <strong>Yaş:</strong> {testResult.userProfile?.age || 'N/A'}
                </div>
                <div>
                  <strong>Cinsel Yönelim:</strong> {testResult.userProfile?.sexual_orientation || 'N/A'}
                </div>
                <div>
                  <strong>İlgilendiği:</strong> {testResult.userProfile?.interested_in || 'N/A'}
                </div>
                <div>
                  <strong>Lokasyon:</strong> {testResult.userProfile?.location || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Sonuçları */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Test Sonuçları ({testResult.compatibilityResults.length} profil)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResult.compatibilityResults.map((result, index) => (
                  <div 
                    key={result.profile.id} 
                    className={`p-4 border rounded-lg ${
                      result.isCompatible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {result.profile.name || 'Anonim'} ({result.profile.age})
                        </h4>
                        <p className="text-sm text-gray-600">
                          {result.profile.gender} • {result.profile.sexual_orientation} • 
                          İlgilendiği: {result.profile.interested_in}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={result.isCompatible ? "default" : "destructive"}>
                          {result.isCompatible ? "✅ Uyumlu" : "❌ Uyumsuz"}
                        </Badge>
                        <Badge variant="outline">
                          {result.score}/100
                        </Badge>
                        <Badge 
                          variant={
                            result.compatibilityLevel === 'high' ? 'default' : 
                            result.compatibilityLevel === 'medium' ? 'secondary' : 'outline'
                          }
                        >
                          {result.compatibilityLevel}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm">
                      <strong>Sebep:</strong> {result.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};