import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function SubscriptionDebugTest() {
  const { user } = useAuth();
  const subscription = useSubscription();
  const [profileData, setProfileData] = useState<any>(null);
  const [subscriberData, setSubscriberData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }
      setProfileData(profile);

      // Fetch subscriber data
      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriberError && subscriberError.code !== 'PGRST116') {
        console.error('Subscriber fetch error:', subscriberError);
      }
      setSubscriberData(subscriber);
    } catch (error) {
      console.error('Debug data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Debug Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please login to see debug information</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subscription Debug Test</CardTitle>
          <Button 
            onClick={fetchDebugData} 
            size="sm" 
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Info */}
          <div>
            <h3 className="font-semibold mb-2">Current User:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify({ id: user.id, email: user.email }, null, 2)}
            </pre>
          </div>

          {/* Profile Data */}
          <div>
            <h3 className="font-semibold mb-2">Profile Data (from profiles table):</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
            {profileData && (
              <div className="mt-2 text-sm">
                <p><strong>Role:</strong> {profileData.role || 'Not set'}</p>
                <p><strong>Subscription Tier:</strong> {profileData.subscription_tier || 'Not set'}</p>
                <p><strong>Subscription Status:</strong> {profileData.subscription_status || 'Not set'}</p>
                <p><strong>Subscription Expires At:</strong> {profileData.subscription_expires_at || 'Not set'}</p>
              </div>
            )}
          </div>

          {/* Subscriber Data */}
          <div>
            <h3 className="font-semibold mb-2">Subscriber Data (from subscribers table):</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(subscriberData, null, 2)}
            </pre>
          </div>

          {/* useSubscription Hook Data */}
          <div>
            <h3 className="font-semibold mb-2">useSubscription Hook Data:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(subscription, null, 2)}
            </pre>
          </div>

          {/* Computed Values */}
          <div>
            <h3 className="font-semibold mb-2">Computed Values:</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Is Premium User:</strong> {subscription.isPremiumUser() ? 'Yes' : 'No'}</p>
              <p><strong>Subscription Tier:</strong> {subscription.subscription_tier}</p>
              <p><strong>Is Subscribed:</strong> {subscription.subscribed ? 'Yes' : 'No'}</p>
              <p><strong>Features:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
                {JSON.stringify(subscription.features, null, 2)}
              </pre>
            </div>
          </div>

          {/* Debug Actions */}
          <div>
            <h3 className="font-semibold mb-2">Debug Actions:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => subscription.checkSubscription()} 
                size="sm"
                variant="secondary"
              >
                Force Refresh Subscription
              </Button>
              <Button 
                onClick={() => {
                  console.log('Full subscription object:', subscription);
                  console.log('Profile data:', profileData);
                  console.log('Subscriber data:', subscriberData);
                }} 
                size="sm"
                variant="secondary"
              >
                Log to Console
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}