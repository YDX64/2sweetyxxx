import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Admin routes with service role access
router.get('/api/admin/stats', async (req, res) => {
  try {
    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify user token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get statistics using service role (bypasses RLS)
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: premiumUsers }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true })
        .eq('subscribed', true)
    ]);

    // Get total revenue (if payments table exists)
    let totalRevenue = 0;
    try {
      const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      
      if (payments) {
        totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      }
    } catch (error) {
      // Payments table might not exist
      console.log('Could not fetch revenue:', error);
    }

    res.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      premiumUsers: premiumUsers || 0,
      totalRevenue: totalRevenue
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role endpoint
router.put('/api/admin/users/:userId/role', async (req, res) => {
  try {
    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { userId } = req.params;
    const { newRole } = req.body;

    // Validate new role
    const validRoles = ['registered', 'silver', 'gold', 'platinum', 'moderator', 'admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify user token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Update user role using service role
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: newRole,
        subscription_tier: newRole === 'admin' || newRole === 'moderator' ? newRole : newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Role update error:', updateError);
      return res.status(500).json({ error: 'Failed to update role' });
    }

    // Also update subscribers table if changing subscription tiers
    if (['silver', 'gold', 'platinum'].includes(newRole)) {
      await supabaseAdmin
        .from('subscribers')
        .upsert({
          user_id: userId,
          subscribed: true,
          subscription_tier: newRole,
          subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          updated_at: new Date().toISOString()
        });
    }

    res.json({ 
      success: true, 
      message: `User role updated to ${newRole}` 
    });

  } catch (error) {
    console.error('Admin role update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users endpoint for admin
router.get('/api/admin/users', async (req, res) => {
  try {
    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify user token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all users with subscription info
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        subscribers!left (
          subscribed,
          subscription_tier,
          subscription_end
        )
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Users fetch error:', usersError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({ users: users || [] });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;