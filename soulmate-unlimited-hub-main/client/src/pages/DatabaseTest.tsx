import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DatabaseTest = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<any>(null);

  const setupAdminUser = async () => {
    setLoading(true);
    setMessage('Setting up admin user...');
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setMessage('Error: Not logged in');
        return;
      }

      // Update user role to admin
      const { data, error } = await supabase
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
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        setMessage(`Error updating profile: ${error.message}`);
      } else {
        setMessage('Admin role set successfully!');
        console.log('Updated profile:', data);
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const addTestData = async () => {
    setLoading(true);
    setMessage('Adding test data...');
    
    try {
      // Add test users
      const testUsers = [
        { name: 'Test User 1', email: 'test1@example.com', age: 25, gender: 'female', bio: 'Looking for love', relationship_type: 'serious' },
        { name: 'Test User 2', email: 'test2@example.com', age: 28, gender: 'male', bio: 'Ready to mingle', relationship_type: 'casual' },
        { name: 'Test User 3', email: 'test3@example.com', age: 22, gender: 'female', bio: 'New to dating', relationship_type: 'friendship' },
        { name: 'Test User 4', email: 'test4@example.com', age: 35, gender: 'male', bio: 'Seeking partner', relationship_type: 'marriage' },
        { name: 'Test User 5', email: 'test5@example.com', age: 27, gender: 'female', bio: 'Happy and single', relationship_type: 'casual' }
      ];

      const usersToInsert = testUsers.map(user => ({
        ...user,
        id: crypto.randomUUID(),
        role: 'registered',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Insert users one by one to avoid type issues
      let errorCount = 0;
      for (const user of usersToInsert) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            ...user,
            role: user.role as 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin'
          });
        
        if (error) {
          errorCount++;
          console.error(`Error adding user ${user.email}:`, error);
        }
      }

      if (errorCount === 0) {
        setMessage('Test data added successfully!');
      } else {
        setMessage(`Added ${usersToInsert.length - errorCount} users with ${errorCount} errors`);
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkStats = async () => {
    setLoading(true);
    setMessage('Checking database stats...');
    
    try {
      // Total users
      const { count: totalUsers, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Users by role
      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .not('role', 'is', null);

      const roleCounts = roleData?.reduce((acc: any, curr) => {
        if (curr.role) {
          acc[curr.role] = (acc[curr.role] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      // Current user info
      const { data: { user } } = await supabase.auth.getUser();
      let currentUserProfile = null;
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        currentUserProfile = data;
      }

      setStats({
        totalUsers,
        roleCounts,
        currentUserProfile,
        errors: { totalError, roleError }
      });

      setMessage('Stats loaded successfully!');
    } catch (error) {
      setMessage(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Database Test & Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={setupAdminUser}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Set Current User as Admin
              </Button>
              <Button
                onClick={addTestData}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Test Data
              </Button>
              <Button
                onClick={checkStats}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Check Database Stats
              </Button>
            </div>

            {message && (
              <div className={`p-4 rounded ${message.includes('Error') ? 'bg-red-900' : 'bg-green-900'}`}>
                <p className="text-white">{message}</p>
              </div>
            )}

            {stats && (
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="text-white font-bold mb-2">Database Statistics</h3>
                  <p className="text-gray-300">Total Users: {stats.totalUsers || 0}</p>
                  <div className="mt-2">
                    <p className="text-gray-300">Users by Role:</p>
                    <ul className="ml-4 text-gray-400">
                      {Object.entries(stats.roleCounts).map(([role, count]) => (
                        <li key={role}>{role}: {count as number}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {stats.currentUserProfile && (
                  <div className="bg-gray-700 p-4 rounded">
                    <h3 className="text-white font-bold mb-2">Current User Profile</h3>
                    <pre className="text-gray-300 text-sm overflow-auto">
                      {JSON.stringify(stats.currentUserProfile, null, 2)}
                    </pre>
                  </div>
                )}

                {(stats.errors.totalError || stats.errors.roleError) && (
                  <div className="bg-red-900 p-4 rounded">
                    <h3 className="text-white font-bold mb-2">Errors</h3>
                    <pre className="text-gray-300 text-sm overflow-auto">
                      {JSON.stringify(stats.errors, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseTest;