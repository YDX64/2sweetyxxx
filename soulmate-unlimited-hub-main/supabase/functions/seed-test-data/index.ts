import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Test user data without hardcoded IDs
const testUsersData = [
  { name: 'Emma Johnson', email: 'emma@test.com', age: 28, gender: 'female', role: 'registered', bio: 'Love hiking and coffee', relationship_type: 'serious' },
  { name: 'James Smith', email: 'james@test.com', age: 32, gender: 'male', role: 'registered', bio: 'Entrepreneur and traveler', relationship_type: 'casual' },
  { name: 'Sophia Davis', email: 'sophia@test.com', age: 26, gender: 'female', role: 'registered', bio: 'Artist and dreamer', relationship_type: 'friendship' },
  { name: 'Oliver Wilson', email: 'oliver@test.com', age: 29, gender: 'male', role: 'registered', bio: 'Software developer', relationship_type: 'serious' },
  { name: 'Isabella Brown', email: 'isabella@test.com', age: 24, gender: 'female', role: 'registered', bio: 'Yoga instructor', relationship_type: 'casual' }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    const { data: adminProfile, error: adminCheckError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminCheckError) throw adminCheckError;
    if (adminProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Access Denied: Admins only.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const usersForSubscription: { id: string; email: string }[] = [];

    for (const testUserData of testUsersData) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', testUserData.email)
        .single();

      if (existingProfile) {
        console.log(`Profile for ${testUserData.email} already exists. Skipping creation.`);
        usersForSubscription.push({ id: existingProfile.id, email: existingProfile.email! });
        continue;
      }
      
      const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: testUserData.email,
        password: 'password123',
        email_confirm: true,
      });

      if (createAuthError) {
        console.error(`Error creating auth user ${testUserData.email}:`, createAuthError.message);
        continue;
      }

      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({ ...testUserData, id: authUser.user.id });

      if (createProfileError) {
        console.error(`Error creating profile for ${testUserData.email}:`, createProfileError.message);
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        continue;
      }
      usersForSubscription.push({ id: authUser.user.id, email: authUser.user.email! });
    }

    if (usersForSubscription.length > 0) {
      const subscriptions = usersForSubscription
        .slice(0, 2)
        .map(u => ({
          user_id: u.id,
          email: u.email,
          subscription_tier: 'silver',
          subscribed: true,
        }));
      
      const { error: subError } = await supabaseAdmin
        .from('subscribers')
        .upsert(subscriptions, { onConflict: 'user_id' });

      if (subError) {
        console.error('Error creating subscriptions:', subError.message);
      }
    }

    return new Response(JSON.stringify({ message: 'Test data setup completed successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 