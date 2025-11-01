import { Router } from 'express';
import { localDb } from '../../config/databases';
import { profiles } from '../../shared/schema';
import { eq, and, ne, sql, desc, asc, gte, lte } from 'drizzle-orm';
import { authenticateRequest } from '../middleware/auth';
import { cache } from '../../config/redis';

const router = Router();

// Middleware to verify auth token
router.use(authenticateRequest);

// Get profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try cache first
    const cacheKey = `profile:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Query local database
    const profile = await localDb
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    
    if (!profile.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Cache for 5 minutes
    await cache.set(cacheKey, profile[0], 300);
    
    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Verify user can only update their own profile
    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    delete updates.email; // Email changes should go through auth
    
    // Check if trying to update locked fields
    const existingProfile = await localDb
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    
    if (!existingProfile[0]) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Update profile
    const updated = await localDb
      .update(profiles)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();
    
    // Invalidate cache
    await cache.del(`profile:${userId}`);
    
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search profiles
router.get('/search', async (req, res) => {
  try {
    const {
      limit = '50',
      minAge,
      maxAge,
      gender,
      maxDistance,
      relationship_type,
    } = req.query;
    
    let query = localDb
      .select()
      .from(profiles)
      .where(ne(profiles.id, req.user?.id || ''))
      .limit(parseInt(limit as string));
    
    // Apply filters
    const conditions = [];
    
    if (minAge) {
      conditions.push(gte(profiles.age, parseInt(minAge as string)));
    }
    
    if (maxAge) {
      conditions.push(lte(profiles.age, parseInt(maxAge as string)));
    }
    
    if (gender) {
      conditions.push(eq(profiles.gender, gender as string));
    }
    
    if (relationship_type) {
      conditions.push(eq(profiles.relationshipType, relationship_type as string));
    }
    
    if (conditions.length > 0) {
      query = localDb
        .select()
        .from(profiles)
        .where(and(ne(profiles.id, req.user?.id || ''), ...conditions))
        .limit(parseInt(limit as string));
    }
    
    const results = await query;
    res.json(results);
  } catch (error) {
    console.error('Error searching profiles:', error);
    res.status(500).json({ error: 'Failed to search profiles' });
  }
});

// Get random profiles for swiping
router.get('/random', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    // Get user preferences
    const userProfile = await localDb
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    
    if (!userProfile[0]) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Get random profiles excluding already swiped
    const randomProfiles = await localDb.execute(sql`
      SELECT p.* FROM profiles p
      WHERE p.id != ${userId}
      AND p.id NOT IN (
        SELECT swiped_id FROM swipes WHERE swiper_id = ${userId}
      )
      AND p.id NOT IN (
        SELECT blocked_id FROM blocks WHERE blocker_id = ${userId}
      )
      AND p.id NOT IN (
        SELECT blocker_id FROM blocks WHERE blocked_id = ${userId}
      )
      ${userProfile[0].interestedIn ? sql`AND p.gender = ${userProfile[0].interestedIn}` : sql``}
      ORDER BY 
        CASE WHEN p.is_boosted = true AND p.boost_expires_at > NOW() THEN 0 ELSE 1 END,
        RANDOM()
      LIMIT ${parseInt(limit as string)}
    `);
    
    res.json(randomProfiles.rows);
  } catch (error) {
    console.error('Error fetching random profiles:', error);
    res.status(500).json({ error: 'Failed to fetch random profiles' });
  }
});

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const existing = await localDb
      .select()
      .from(profiles)
      .where(eq(profiles.name, username))
      .limit(1);
    
    res.json({ available: existing.length === 0 });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

// Get profile by username
router.get('/username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const profile = await localDb
      .select()
      .from(profiles)
      .where(eq(profiles.name, username))
      .limit(1);
    
    if (!profile.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update last active
router.post('/:userId/last-active', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await localDb
      .update(profiles)
      .set({
        updatedAt: new Date()
      })
      .where(eq(profiles.id, userId));
    
    // Invalidate cache
    await cache.del(`profile:${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating last active:', error);
    res.status(500).json({ error: 'Failed to update last active' });
  }
});

export default router;