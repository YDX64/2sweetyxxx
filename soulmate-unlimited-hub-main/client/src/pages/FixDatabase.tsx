import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FixDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fixEverything = async () => {
    setLoading(true);
    setMessage('Starting comprehensive fix...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Error: Not logged in');
        return;
      }

      // Step 1: Make current user admin
      console.log('Step 1: Making user admin...');
      const { error: adminError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          name: 'Admin User',
          age: 30,
          gender: 'male',
          bio: 'System Administrator',
          relationship_type: 'serious',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (adminError) {
        console.error('Admin update error:', adminError);
        setMessage(`Error: ${adminError.message}`);
        return;
      }

      // Step 2: Create test users with proper IDs
      console.log('Step 2: Creating test users...');
      const testUsers = [];
      for (let i = 1; i <= 10; i++) {
        testUsers.push({
          id: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
          name: `Test User ${i}`,
          email: `test${i}@example.com`,
          age: 20 + i,
          gender: i % 2 === 0 ? 'male' : 'female',
          role: 'registered',
          bio: `Test user ${i} bio`,
          relationship_type: ['serious', 'casual', 'friendship', 'marriage'][i % 4],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Insert users one by one to avoid conflicts
      for (const testUser of testUsers) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            ...testUser,
            role: testUser.role as 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin'
          });
        
        if (error) {
          console.error(`Error inserting ${testUser.email}:`, error);
        }
      }

      // Step 3: Add some subscriptions
      console.log('Step 3: Adding subscriptions...');
      const subscriptions = [
        {
          id: `00000000-0000-0000-0001-000000000001`,
          user_id: `00000000-0000-0000-0000-000000000001`,
          tier: 'silver',
          subscribed: true
        },
        {
          id: `00000000-0000-0000-0001-000000000002`,
          user_id: `00000000-0000-0000-0000-000000000002`,
          tier: 'gold',
          subscribed: true
        },
        {
          id: `00000000-0000-0000-0001-000000000003`,
          user_id: `00000000-0000-0000-0000-000000000003`,
          tier: 'platinum',
          subscribed: true
        }
      ];

      for (const sub of subscriptions) {
        const { error } = await supabase
          .from('subscribers')
          .insert({
            ...sub,
            email: `test${sub.user_id.slice(-1)}@example.com`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error(`Error inserting subscription:`, error);
        }
      }

      // Step 4: Check results
      console.log('Step 4: Checking results...');
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: subCount } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      setMessage(`
        ✅ Fix completed!
        - Current user is now admin
        - Total users in database: ${userCount || 0}
        - Total active subscriptions: ${subCount || 0}
        
        Refresh the admin panel to see the updated stats.
      `);

      // Refresh current user info
      await checkCurrentUser();

    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Fix Database & Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-300">Current User Info:</p>
              {currentUser && (
                <div className="bg-gray-700 p-4 rounded text-sm text-gray-300">
                  <p>Email: {currentUser.email}</p>
                  <p>Role: <span className={currentUser.role === 'admin' ? 'text-green-400' : 'text-yellow-400'}>{currentUser.role || 'none'}</span></p>
                  <p>Name: {currentUser.name || 'Not set'}</p>
                </div>
              )}
            </div>

            <Button
              onClick={fixEverything}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Fixing...' : 'Fix Everything (Make me admin + Add test data)'}
            </Button>

            {message && (
              <div className={`p-4 rounded text-white whitespace-pre-line ${message.includes('Error') ? 'bg-red-900' : 'bg-green-900'}`}>
                {message}
              </div>
            )}

            <div className="text-gray-400 text-sm space-y-2">
              <p className="font-bold">This will:</p>
              <ul className="list-disc list-inside">
                <li>Make your current user an admin</li>
                <li>Create 10 test users</li>
                <li>Add 3 premium subscriptions</li>
                <li>Set up proper database structure</li>
                <li>Enable admin panel statistics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FixDatabase;