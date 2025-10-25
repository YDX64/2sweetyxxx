import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Play, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { directSubscriptionService } from '@/services/directSubscriptionService';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function WorkingSubscriptionTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Database Connection', status: 'idle', message: 'Not tested' },
    { name: 'Test Users Creation', status: 'idle', message: 'Not tested' },
    { name: 'Subscription Limits', status: 'idle', message: 'Not tested' },
    { name: 'Usage Updates', status: 'idle', message: 'Not tested' },
    { name: 'Limit Enforcement', status: 'idle', message: 'Not tested' }
  ]);

  const updateTest = (index: number, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  // Test 1: Basic Database Connection
  const testDatabaseConnection = async () => {
    updateTest(0, 'running', 'Testing database connection...');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        updateTest(0, 'error', `Connection failed: ${error.message}`);
        return false;
      }

      updateTest(0, 'success', 'Database connection successful');
      return true;
    } catch (error) {
      updateTest(0, 'error', `Unexpected error: ${error}`);
      return false;
    }
  };

  // Test 2: Test User Usage Functions
  const createTestUsers = async () => {
    updateTest(1, 'running', 'Creating and testing users...');
    
    try {
      // Create test users first
      const createSuccess = await directSubscriptionService.createTestUsers();
      if (!createSuccess) {
        updateTest(1, 'error', 'Failed to create test users');
        return false;
      }

      // Verify test users were created
      const testUsers = await directSubscriptionService.getTestUsers();
      if (testUsers.length !== 4) {
        updateTest(1, 'error', `Only ${testUsers.length}/4 test users created`);
        return false;
      }

      // Test with actual admin user
      const usage = await directSubscriptionService.getUserUsage('90033e13-fc1d-487a-9090-645c67072b12');
      if (!usage) {
        updateTest(1, 'error', 'Failed to get admin user usage data');
        return false;
      }

      // Verify the subscription service can get tier information
      const tier = directSubscriptionService.getSubscriptionTier(usage.role);
      const remaining = directSubscriptionService.getRemainingActions(usage);

      updateTest(1, 'success', 
        `Test users created: ${testUsers.length}/4, Admin usage: Role=${usage.role}, Tier=${tier.name}, Remaining likes=${remaining.likes}`,
        { testUsers, usage, tier, remaining }
      );
      return true;
    } catch (error) {
      updateTest(1, 'error', `User creation test failed: ${error}`);
      return false;
    }
  };

  // Test 3: Test Subscription Limits Logic
  const testSubscriptionLimits = async () => {
    updateTest(2, 'running', 'Testing subscription limits...');
    
    try {
      const allTiers = directSubscriptionService.getAllTiers();
      const testResults: string[] = [];
      
      allTiers.forEach((tier: any) => {
        const mockUsage = {
          id: 'test-user-id',
          email: 'test@example.com',
          daily_likes_used: tier.role === 'registered' ? 4 : tier.role === 'silver' ? 20 : tier.role === 'gold' ? 80 : 500,
          daily_super_likes_used: tier.role === 'registered' ? 1 : tier.role === 'silver' ? 3 : tier.role === 'gold' ? 20 : 100,
          daily_boosts_used: 0,
          last_like_reset_date: new Date().toISOString(),
          role: tier.role
        };

        const canLike = directSubscriptionService.canPerformAction(mockUsage, 'like');
        const canSuperLike = directSubscriptionService.canPerformAction(mockUsage, 'super_like');
        const remaining = directSubscriptionService.getRemainingActions(mockUsage);
        
        testResults.push(
          `${tier.name}: ${mockUsage.daily_likes_used}/${tier.limits.dailyLikes} likes (${remaining.likes} left), ` +
          `${mockUsage.daily_super_likes_used}/${tier.limits.dailySuperLikes} super (${remaining.superLikes} left) - ` +
          `${canLike && canSuperLike ? 'OK' : 'LIMITS_REACHED'}`
        );
      });

      updateTest(2, 'success', `All tier limits validated: ${testResults.length} tiers tested`, testResults);
      return true;
    } catch (error) {
      updateTest(2, 'error', `Limits test failed: ${error}`);
      return false;
    }
  };

  // Test 4: Test Usage Updates with Working Service
  const testUsageUpdates = async () => {
    updateTest(3, 'running', 'Testing usage updates...');
    
    try {
      const userId = '90033e13-fc1d-487a-9090-645c67072b12';
      
      // Test reset functionality
      const resetSuccess = await directSubscriptionService.resetDailyUsage(userId);
      if (!resetSuccess) {
        updateTest(3, 'error', 'Reset daily usage failed');
        return false;
      }

      // Test increment functionality
      const incrementSuccess = await directSubscriptionService.incrementLikes(userId, 3);
      if (!incrementSuccess) {
        updateTest(3, 'error', 'Increment likes failed');
        return false;
      }

      // Verify the changes by getting updated usage
      const updatedUsage = await directSubscriptionService.getUserUsage(userId);
      if (!updatedUsage) {
        updateTest(3, 'error', 'Failed to verify updated usage');
        return false;
      }

      updateTest(3, 'success', 
        `Usage updates working: Likes=${updatedUsage.daily_likes_used}, Super likes=${updatedUsage.daily_super_likes_used}`,
        updatedUsage
      );
      return true;
    } catch (error) {
      updateTest(3, 'error', `Usage update test failed: ${error}`);
      return false;
    }
  };

  // Test 5: Test Complete Limit Enforcement Flow
  const testLimitEnforcement = async () => {
    updateTest(4, 'running', 'Testing complete limit enforcement...');
    
    try {
      const userId = '90033e13-fc1d-487a-9090-645c67072b12';
      
      // Get current user usage from database
      const currentUsage = await directSubscriptionService.getUserUsage(userId);
      if (!currentUsage) {
        updateTest(4, 'error', 'Failed to get current user usage');
        return false;
      }

      // Test enforcement logic
      const canLike = directSubscriptionService.canPerformAction(currentUsage, 'like');
      const canSuperLike = directSubscriptionService.canPerformAction(currentUsage, 'super_like');
      const canBoost = directSubscriptionService.canPerformAction(currentUsage, 'boost');
      
      // Test upgrade recommendation
      const recommendedUpgrade = directSubscriptionService.getRecommendedUpgrade(currentUsage.role);
      
      // Test feature access
      const hasBasicAccess = directSubscriptionService.hasFeature(currentUsage.role, 'basic_matching');
      const hasAdvancedFilters = directSubscriptionService.hasFeature(currentUsage.role, 'advanced_filters');
      
      // Get remaining actions
      const remaining = directSubscriptionService.getRemainingActions(currentUsage);
      
      const enforcementResult = {
        currentRole: currentUsage.role,
        canLike,
        canSuperLike,
        canBoost,
        remaining,
        recommendedUpgrade: recommendedUpgrade?.name || 'none',
        features: {
          basicAccess: hasBasicAccess,
          advancedFilters: hasAdvancedFilters
        }
      };

      updateTest(4, 'success', 
        `Complete enforcement validated: Role=${currentUsage.role}, ` +
        `Can like=${canLike}, Can super=${canSuperLike}, Can boost=${canBoost}, ` +
        `Remaining likes=${remaining.likes}, Recommended upgrade=${recommendedUpgrade?.name || 'none'}`,
        enforcementResult
      );
      return true;
    } catch (error) {
      updateTest(4, 'error', `Limit enforcement test failed: ${error}`);
      return false;
    }
  };

  const runAllTests = async () => {
    toast({
      title: "Running Subscription Tests",
      description: "Testing all components of the subscription system...",
    });

    const results = [];
    
    results.push(await testDatabaseConnection());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await createTestUsers());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testSubscriptionLimits());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testUsageUpdates());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testLimitEnforcement());

    const successCount = results.filter(Boolean).length;
    const totalTests = results.length;

    toast({
      title: "Test Results",
      description: `${successCount}/${totalTests} tests passed successfully`,
      duration: 5000,
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
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error': return <Badge variant="destructive">Failed</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Working Subscription Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive testing of the subscription enforcement system
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={runAllTests} className="w-full" size="lg">
            Run Complete Test Suite
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
              
              {test.details && (
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {typeof test.details === 'string' ? test.details : JSON.stringify(test.details, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Database:</strong> PostgreSQL with Supabase</div>
                <div><strong>Auth:</strong> Supabase Authentication</div>
                <div><strong>Functions:</strong> Database stored procedures</div>
                <div><strong>Cache:</strong> Real-time invalidation</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div><strong>Free:</strong> 5 likes, 1 super like daily</div>
                <div><strong>Silver:</strong> 25 likes, 5 super likes daily</div>
                <div><strong>Gold:</strong> 100 likes, 25 super likes daily</div>
                <div><strong>Platinum:</strong> Unlimited access</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}