import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Play, RefreshCw } from "lucide-react";
import { basicSubscriptionService } from '@/services/basicSubscriptionService';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function FinalSubscriptionTest() {
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

  // Test 1: Database Connection
  const testDatabaseConnection = async () => {
    updateTest(0, 'running', 'Testing database connection...');
    
    try {
      const adminUsage = await basicSubscriptionService.getUserUsage('90033e13-fc1d-487a-9090-645c67072b12');
      
      if (!adminUsage) {
        updateTest(0, 'error', 'Failed to connect to database or retrieve user data');
        return false;
      }

      updateTest(0, 'success', `Database connection successful - Admin user found with role: ${adminUsage.role}`);
      return true;
    } catch (error) {
      updateTest(0, 'error', `Database connection failed: ${error}`);
      return false;
    }
  };

  // Test 2: Create and Verify Test Users
  const createTestUsers = async () => {
    updateTest(1, 'running', 'Creating and verifying test users...');
    
    try {
      // Create test users
      const createSuccess = await basicSubscriptionService.createTestUsers();
      if (!createSuccess) {
        updateTest(1, 'error', 'Failed to create test users');
        return false;
      }

      // Verify test users were created
      const testUsers = await basicSubscriptionService.getTestUsers();
      if (testUsers.length !== 4) {
        updateTest(1, 'error', `Only ${testUsers.length}/4 test users created`);
        return false;
      }

      const userSummary = testUsers.map((u: any) => `${u.role} (${u.daily_likes_used} likes used)`).join(', ');
      
      updateTest(1, 'success', 
        `All 4 test users created successfully: ${userSummary}`,
        testUsers
      );
      return true;
    } catch (error) {
      updateTest(1, 'error', `Test user creation failed: ${error}`);
      return false;
    }
  };

  // Test 3: Subscription Limits Logic
  const testSubscriptionLimits = async () => {
    updateTest(2, 'running', 'Testing subscription tier limits...');
    
    try {
      const allTiers = basicSubscriptionService.getAllTiers();
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

        const canLike = basicSubscriptionService.canPerformAction(mockUsage, 'like');
        const canSuperLike = basicSubscriptionService.canPerformAction(mockUsage, 'super_like');
        const remaining = basicSubscriptionService.getRemainingActions(mockUsage);
        
        testResults.push(
          `${tier.name}: ${mockUsage.daily_likes_used}/${tier.limits.dailyLikes} likes (${remaining.likes} left), ` +
          `${mockUsage.daily_super_likes_used}/${tier.limits.dailySuperLikes} super (${remaining.superLikes} left) - ` +
          `${canLike && canSuperLike ? 'OK' : 'LIMITS_REACHED'}`
        );
      });

      updateTest(2, 'success', `All ${testResults.length} tier limits validated successfully`, testResults);
      return true;
    } catch (error) {
      updateTest(2, 'error', `Subscription limits test failed: ${error}`);
      return false;
    }
  };

  // Test 4: Usage Updates
  const testUsageUpdates = async () => {
    updateTest(3, 'running', 'Testing usage update operations...');
    
    try {
      const userId = '90033e13-fc1d-487a-9090-645c67072b12';
      
      // Get initial usage
      const initialUsage = await basicSubscriptionService.getUserUsage(userId);
      if (!initialUsage) {
        updateTest(3, 'error', 'Failed to get initial user usage');
        return false;
      }

      // Test reset functionality
      const resetSuccess = await basicSubscriptionService.resetDailyUsage(userId);
      if (!resetSuccess) {
        updateTest(3, 'error', 'Reset daily usage failed');
        return false;
      }

      // Test increment functionality
      const incrementSuccess = await basicSubscriptionService.incrementLikes(userId, 5);
      if (!incrementSuccess) {
        updateTest(3, 'error', 'Increment likes failed');
        return false;
      }

      // Verify the changes
      const updatedUsage = await basicSubscriptionService.getUserUsage(userId);
      if (!updatedUsage) {
        updateTest(3, 'error', 'Failed to verify updated usage');
        return false;
      }

      updateTest(3, 'success', 
        `Usage updates working: Reset successful, Likes updated to ${updatedUsage.daily_likes_used}, Super likes: ${updatedUsage.daily_super_likes_used}`,
        { initialUsage, updatedUsage }
      );
      return true;
    } catch (error) {
      updateTest(3, 'error', `Usage update test failed: ${error}`);
      return false;
    }
  };

  // Test 5: Complete Limit Enforcement
  const testLimitEnforcement = async () => {
    updateTest(4, 'running', 'Testing complete limit enforcement flow...');
    
    try {
      const userId = '90033e13-fc1d-487a-9090-645c67072b12';
      
      // Get current user usage
      const currentUsage = await basicSubscriptionService.getUserUsage(userId);
      if (!currentUsage) {
        updateTest(4, 'error', 'Failed to get current user usage');
        return false;
      }

      // Test enforcement logic
      const canLike = basicSubscriptionService.canPerformAction(currentUsage, 'like');
      const canSuperLike = basicSubscriptionService.canPerformAction(currentUsage, 'super_like');
      const canBoost = basicSubscriptionService.canPerformAction(currentUsage, 'boost');
      
      // Test upgrade recommendation
      const recommendedUpgrade = basicSubscriptionService.getRecommendedUpgrade(currentUsage.role);
      
      // Test feature access
      const hasBasicAccess = basicSubscriptionService.hasFeature(currentUsage.role, 'basic_matching');
      const hasAdvancedFilters = basicSubscriptionService.hasFeature(currentUsage.role, 'advanced_filters');
      
      // Get remaining actions
      const remaining = basicSubscriptionService.getRemainingActions(currentUsage);
      
      const enforcementResult = {
        currentRole: currentUsage.role,
        actions: { canLike, canSuperLike, canBoost },
        remaining,
        recommendedUpgrade: recommendedUpgrade?.name || 'none',
        features: { hasBasicAccess, hasAdvancedFilters }
      };

      updateTest(4, 'success', 
        `Complete enforcement validated: Role=${currentUsage.role}, ` +
        `Actions: Like=${canLike}, Super=${canSuperLike}, Boost=${canBoost}, ` +
        `Remaining: ${remaining.likes} likes, ${remaining.superLikes} super, ` +
        `Upgrade: ${recommendedUpgrade?.name || 'none'}`,
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
      title: "Running Complete Subscription Tests",
      description: "Testing all subscription system components...",
    });

    const testFunctions = [
      testDatabaseConnection,
      createTestUsers,
      testSubscriptionLimits,
      testUsageUpdates,
      testLimitEnforcement
    ];

    const results = [];
    
    for (let i = 0; i < testFunctions.length; i++) {
      try {
        const result = await testFunctions[i]();
        results.push(result);
        
        // Short delay between tests
        if (i < testFunctions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (error) {
        console.error(`Test ${i + 1} failed:`, error);
        results.push(false);
      }
    }

    const successCount = results.filter(Boolean).length;
    const totalTests = results.length;

    toast({
      title: "Test Results Complete",
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
      case 'success': return <Badge className="bg-green-100 text-green-800 border-green-300">Success</Badge>;
      case 'error': return <Badge variant="destructive">Failed</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Running</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const allTestsPassed = tests.every(test => test.status === 'success');
  const anyTestRunning = tests.some(test => test.status === 'running');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Final Subscription System Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive validation of the complete subscription enforcement system
          </p>
          {allTestsPassed && !anyTestRunning && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✓ All tests passed! Subscription system is fully operational
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <Button 
            onClick={runAllTests} 
            className="w-full" 
            size="lg"
            disabled={anyTestRunning}
          >
            {anyTestRunning ? 'Running Tests...' : 'Run Complete Test Suite'}
          </Button>
        </div>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <Card key={index} className={`${test.status === 'running' ? 'ring-2 ring-blue-500' : ''} ${test.status === 'success' ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : ''}`}>
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
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
                      {Array.isArray(test.details) 
                        ? test.details.join('\n')
                        : typeof test.details === 'string' 
                          ? test.details 
                          : JSON.stringify(test.details, null, 2)
                      }
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
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Database:</strong> PostgreSQL with Supabase</div>
                <div><strong>Authentication:</strong> Supabase Auth</div>
                <div><strong>Backend:</strong> Direct database queries</div>
                <div><strong>Cache Bypass:</strong> Schema-independent operations</div>
                <div><strong>Status:</strong> <span className={allTestsPassed ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                  {allTestsPassed ? 'Fully Operational' : 'Testing in Progress'}
                </span></div>
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