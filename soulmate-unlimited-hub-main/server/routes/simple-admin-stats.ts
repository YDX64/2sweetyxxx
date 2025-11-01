import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/api/admin/stats', async (req, res) => {
  try {
    // Simple, direct query - no complications!
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM profiles)::int as total_users,
        (SELECT COUNT(*) FROM profiles WHERE updated_at > NOW() - INTERVAL '7 days')::int as active_users,
        (SELECT COUNT(*) FROM subscribers WHERE subscribed = true)::int as premium_users,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'succeeded')::int as total_revenue_cents
    `);
    
    const stats = result.rows[0];
    
    return res.json({
      totalUsers: stats.total_users,
      activeUsers: stats.active_users,
      premiumUsers: stats.premium_users,
      totalRevenue: stats.total_revenue_cents / 100
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

export default router;