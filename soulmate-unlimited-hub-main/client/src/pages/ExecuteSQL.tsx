import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { getErrorMessage } from '@/types/common';

const ExecuteSQL = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription_tier } = useSubscription();

  useEffect(() => {
    checkAdminStatus();
  }, [user, subscription_tier]);

  const checkAdminStatus = async () => {
    setChecking(true);
    try {
      // Check if user is authenticated
      if (!user) {
        setMessage('You must be logged in to access this page.');
        setChecking(false);
        return;
      }

      // Check if user has admin privileges
      const adminCheck = subscription_tier === 'admin' || subscription_tier === 'moderator';
      
      if (!adminCheck) {
        setMessage('Access denied. Admin privileges required.');
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      setIsAdmin(true);
      setMessage('Admin access verified. You can safely execute admin operations.');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setMessage('Error verifying admin status. Please try again.');
      setIsAdmin(false);
    } finally {
      setChecking(false);
    }
  };

  const executeAdminPolicies = async () => {
    if (!isAdmin) {
      setMessage('Access denied. Admin privileges required.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Double-check admin status before executing
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user?.id || '')
        .single();

      if (profileError || !profile) {
        throw new Error('Unable to verify admin privileges');
      }

      if (profile.subscription_tier !== 'admin' && profile.subscription_tier !== 'moderator') {
        throw new Error('Insufficient privileges. Admin or moderator role required.');
      }

      const { data, error } = await supabase.functions.invoke('seed-test-data');

      if (error) {
        throw new Error(`Function invocation failed: ${error.message}`);
      }
      
      if (data.error) {
         throw new Error(`Function execution error: ${data.error}`);
      }

      setMessage(data.message || 'Admin setup completed successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error) {
      console.error("Error executing admin setup:", error);
      setMessage(`Error: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Checking Permissions...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-400 text-center">
              <p>Verifying admin privileges...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-red-400 text-center">
              <p>You must be logged in to access this page.</p>
            </div>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-red-400 text-center">
              <p>Admin privileges required to access this page.</p>
              <p className="text-sm mt-2">Current role: {subscription_tier || 'registered'}</p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-center">Execute Admin Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={executeAdminPolicies}
            disabled={loading || !isAdmin}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
          >
            {loading ? 'Executing...' : 'Add Test Data (Admin Only)'}
          </Button>
          
          {message && (
            <div className={`p-4 rounded text-white ${
              message.includes('error') || message.includes('failed') || message.includes('denied')
                ? 'bg-red-900'
                : message.includes('verified')
                  ? 'bg-blue-900'
                  : 'bg-green-900'
            }`}>
              {message}
            </div>
          )}
          
          <div className="text-gray-400 text-sm">
            <p>This will securely:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Verify you are an admin on the server</li>
              <li>Create 5 test auth users if they don't exist</li>
              <li>Create profiles linked to them</li>
              <li>Add test subscriptions for 2 of them</li>
              <li>Redirect to admin panel on success</li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Current user: {user?.email} | Role: {subscription_tier || 'registered'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecuteSQL;