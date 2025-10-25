import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { db } from "./db";
import { profiles } from "@shared/schema";
import { insertProfileSchema, insertConversationSchema, insertMessageSchema, insertSwipeSchema, insertSuperLikeSchema, insertUserPreferencesSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { mediaModerationService } from "./mediaModeration";
import { SecurityService, requireRole, requirePermission, RESTRICTED_ACTIONS } from "./security";
import { SecurityMonitor, securityLoggingMiddleware } from "./security-monitor";
import { NotificationService } from "./notification-service";
import Stripe from 'stripe';
import { getErrorMessage } from "./types/common";

// Create Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add security logging middleware
  app.use(securityLoggingMiddleware);
  
  // Simple health check endpoint (no database dependency)
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Detailed health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: '2sweety-api',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });
  
  // Configure multer for photo uploads
  const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
  
  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});
  
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      cb(null, filename);
    }
  });

  const upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files allowed'));
      }
    }
  });

  // Session-based authentication middleware for Supabase
  const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: any) => {
    try {
      let token: string | undefined;
      let userId: string | undefined;

      // Check for token in Authorization header
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
        console.log('🔐 [Auth] Using token from Authorization header');
      }
      else if (req.cookies && req.cookies['sb-access-token']) {
        token = req.cookies['sb-access-token'];
        console.log('🔐 [Auth] Using token from cookie');
      }

      if (!token) {
        console.log('🔐 [Auth] No token found in request');
        SecurityMonitor.logSecurityEvent('anonymous', req.path, 'denied', 'No authentication', 'low');
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Use proper JWT verification instead of manual parsing
      try {
        // Get JWT secret from environment
        const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.error('🔐 [Auth] JWT secret not configured');
          return res.status(500).json({ error: 'Server configuration error' });
        }

        // Verify JWT token properly
        const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        
        if (decoded.exp && decoded.exp > Date.now() / 1000) {
          userId = decoded.sub;
          console.log('🔐 [Auth] JWT token verification successful, userId:', userId);
        } else {
          console.log('🔐 [Auth] Token expired');
          return res.status(401).json({ error: 'Token expired' });
        }
      } catch (e) {
        console.error('🔐 [Auth] JWT token verification failed:', e);
        SecurityMonitor.logSecurityEvent('unknown', req.path, 'denied', 'Invalid JWT token', 'high');
        return res.status(401).json({ error: 'Invalid token' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Skip database verification for now since service role key is invalid
      // Just trust the JWT token from Supabase
      console.log('🔐 [Auth] Skipping database verification, trusting JWT');

      console.log('🔐 [Auth] Authentication successful for user:', userId);
      req.userId = userId;
      next();
    } catch (error) {
      console.error('🔐 [Auth] Authentication error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Profile routes
  app.get('/api/profiles/:id', async (req, res) => {
    try {
      const profile = await dbStorage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.post('/api/profiles', authenticateUser, async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await dbStorage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid profile data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create profile' });
    }
  });

  app.put('/api/profiles/:id', authenticateUser, async (req, res) => {
    try {
      const updates = req.body;
      const profile = await dbStorage.updateProfile(req.params.id, updates);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Discovery routes
  app.get('/api/discovery/profiles', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      
      // Get user's profile to understand preferences
      const userProfile = await dbStorage.getProfile(userId);
      if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      
      // Get user preferences
      const preferences = await dbStorage.getUserPreferences(userId);
      
      // Get already swiped users
      const swipes = await dbStorage.getSwipesByUser(userId);
      const swipedUserIds = swipes.map(s => s.targetUserId);
      
      // Get blocked users
      const blocks = await dbStorage.getUserBlocks(userId);
      const blockedUserIds = blocks.map(b => b.blockedUserId);
      
      // Combine excluded IDs
      const excludedIds = [...swipedUserIds, ...blockedUserIds, userId];
      
      // Build query for discovery
      let query = supabaseAdmin
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .not('name', 'is', null)
        .not('age', 'is', null);
      
      // Only add exclusion if there are IDs to exclude
      if (excludedIds.length > 1) { // > 1 because userId is always included
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
      }
      
      const { data: profiles, error } = await query.limit(50);
      
      if (error) {
        console.error('Discovery profiles error:', error);
        return res.status(500).json({ error: 'Failed to fetch discovery profiles' });
      }
      
      // Filter by user preferences
      let filteredProfiles = profiles || [];
      
      // Age filter
      if (preferences) {
        filteredProfiles = filteredProfiles.filter(p => 
          p.age >= (preferences.minAge || 18) && 
          p.age <= (preferences.maxAge || 100)
        );
      }
      
      // Gender/orientation filter
      if (userProfile.interestedIn && userProfile.interestedIn !== 'both') {
        const targetGender = userProfile.interestedIn === 'men' ? 'male' : 'female';
        filteredProfiles = filteredProfiles.filter(p => p.gender === targetGender);
      }
      
      res.json(filteredProfiles);
    } catch (error) {
      console.error('Discovery error:', error);
      res.status(500).json({ error: 'Failed to fetch discovery profiles' });
    }
  });

  // Swipe routes
  app.post('/api/swipes', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const swipeData = insertSwipeSchema.parse({
        ...req.body,
        userId: req.userId!
      });
      
      // Check if already swiped
      const existingSwipe = await dbStorage.checkSwipe(swipeData.userId, swipeData.targetUserId);
      if (existingSwipe) {
        return res.status(400).json({ error: 'Already swiped on this user' });
      }
      
      const swipe = await dbStorage.createSwipe(swipeData);
      
      // Check for match if it's a right swipe
      if (swipeData.direction === 'right') {
        const reciprocalSwipe = await dbStorage.checkSwipe(swipeData.targetUserId, swipeData.userId);
        if (reciprocalSwipe && reciprocalSwipe.direction === 'right') {
          // Create match
          const match = await dbStorage.createMatch({
            user1Id: swipeData.userId,
            user2Id: swipeData.targetUserId
          });
          return res.json({ swipe, match, isMatch: true });
        }
      }
      
      res.json({ swipe, isMatch: false });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid swipe data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create swipe' });
    }
  });

  // Super like routes
  app.post('/api/super-likes', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const superLikeData = insertSuperLikeSchema.parse({
        ...req.body,
        userId: req.userId!
      });
      
      const superLike = await dbStorage.createSuperLike(superLikeData);
      res.status(201).json(superLike);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid super like data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create super like' });
    }
  });

  // Match routes
  app.get('/api/matches', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const matches = await dbStorage.getMatchesByUser(req.userId!);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });

  // Conversation routes
  app.get('/api/conversations', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const conversations = await dbStorage.getConversationsByUser(req.userId!);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.post('/api/conversations', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { participantId } = req.body;
      const conversation = await dbStorage.getOrCreateConversation(req.userId!, participantId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  // Message routes
  app.get('/api/conversations/:id/messages', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const messages = await dbStorage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/conversations/:id/messages', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId: req.params.id,
        senderId: req.userId!
      });
      
      const message = await dbStorage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid message data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create message' });
    }
  });

  // User preferences routes
  app.get('/api/user-preferences', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const preferences = await dbStorage.getUserPreferences(req.userId!);
      if (!preferences) {
        return res.status(404).json({ error: 'User preferences not found' });
      }
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
  });

  app.post('/api/user-preferences', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const preferencesData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId: req.userId!
      });
      
      const preferences = await dbStorage.createOrUpdateUserPreferences(preferencesData);
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid preferences data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update user preferences' });
    }
  });

  // Subscription routes (ported from Supabase Edge Functions)
  app.post('/api/create-checkout', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { plan, billing } = req.body;
      
      // Return placeholder response - user would need to provide Stripe API keys
      res.json({ 
        error: 'Stripe integration requires API keys',
        plan,
        billing,
        note: 'Please provide STRIPE_SECRET_KEY to enable payment processing'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  app.get('/api/check-subscription', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId!;
    console.log(`[SUB_CHECK_START] User ID: ${userId} - Starting subscription check.`);

    let response = {
      subscribed: false,
      subscription_tier: 'registered',
      source: 'default',
      subscription_end: undefined as string | undefined | null,
    };

    try {
      // Step 1: Check subscribers table for an active subscription
      console.log(`[SUB_CHECK_STEP_1] User ID: ${userId} - Checking 'subscribers' table.`);
      const subscriber = await dbStorage.getSubscriberByUserId(userId);
      console.log(`[SUB_CHECK_STEP_1_DATA] User ID: ${userId} - Subscriber data:`, subscriber);

      if (subscriber && subscriber.subscribed) {
        const isSubscriptionActive = !subscriber.subscriptionEnd || new Date(subscriber.subscriptionEnd) > new Date();
        if (isSubscriptionActive) {
          response = {
            subscribed: true,
            subscription_tier: subscriber.subscriptionTier || 'registered',
            source: 'subscribers_table_active',
            subscription_end: subscriber.subscriptionEnd ? subscriber.subscriptionEnd.toISOString() : null,
          };
          console.log(`[SUB_CHECK_FOUND_ACTIVE_SUBSCRIBER] User ID: ${userId} - Active subscription found in 'subscribers' table. Response:`, response);
          return res.json(response);
        }
        console.log(`[SUB_CHECK_STEP_1_EXPIRED] User ID: ${userId} - Subscription in 'subscribers' table found but expired/inactive. End date: ${subscriber.subscriptionEnd}`);
      } else {
        console.log(`[SUB_CHECK_STEP_1_NONE] User ID: ${userId} - No active or existing subscription in 'subscribers' table.`);
      }

      // Step 2: If no active subscription in 'subscribers', check 'profiles' table
      console.log(`[SUB_CHECK_STEP_2] User ID: ${userId} - Checking 'profiles' table.`);
      const profile = await dbStorage.getProfile(userId);
      console.log(`[SUB_CHECK_STEP_2_DATA] User ID: ${userId} - Profile data:`, {
        id: profile?.id,
        role: profile?.role,
        subscriptionStatus: profile?.subscriptionStatus,
        subscriptionExpiresAt: profile?.subscriptionExpiresAt,
      });

      if (profile?.role && profile.role !== 'registered') {
        let profileSubscriptionActive = false;
        // Admin role is always considered active for display purposes
        if (profile.role === 'admin') {
          profileSubscriptionActive = true;
          console.log(`[SUB_CHECK_STEP_2_ADMIN] User ID: ${userId} - Admin role detected, considered active.`);
        } else if (profile.subscriptionStatus === 'active') {
          profileSubscriptionActive = true;
          console.log(`[SUB_CHECK_STEP_2_STATUS_ACTIVE] User ID: ${userId} - Profile subscriptionStatus is 'active'.`);
        } else if (profile.subscriptionExpiresAt && new Date(profile.subscriptionExpiresAt) > new Date()) {
          profileSubscriptionActive = true;
          console.log(`[SUB_CHECK_STEP_2_EXPIRY_FUTURE] User ID: ${userId} - Profile subscriptionExpiresAt is in the future: ${profile.subscriptionExpiresAt}.`);
        } else {
           console.log(`[SUB_CHECK_STEP_2_INACTIVE_PROFILE] User ID: ${userId} - Profile role ${profile.role} does not imply active subscription based on status/expiry.`);
        }

        if (profileSubscriptionActive) {
          response = {
            subscribed: true,
            subscription_tier: profile.role, // Use profile role as the tier
            source: 'profiles_table_role_as_tier',
            subscription_end: profile.subscriptionExpiresAt ? profile.subscriptionExpiresAt.toISOString() : null,
          };
          console.log(`[SUB_CHECK_FOUND_PROFILE_TIER] User ID: ${userId} - Using profile role as active tier. Response:`, response);
          return res.json(response);
        }
      } else {
        console.log(`[SUB_CHECK_STEP_2_NO_ROLE] User ID: ${userId} - Profile role is 'registered' or not set.`);
      }

      // Step 3: If an expired entry was found in 'subscribers' table earlier, use its end date
      if (subscriber && !subscriber.subscribed && subscriber.subscriptionEnd) {
         // This means an entry existed but was not active (e.g. expired or cancelled)
        response = {
          subscribed: false,
          subscription_tier: 'registered', // Ensure tier is 'registered' for expired/inactive
          source: 'subscribers_table_expired',
          subscription_end: subscriber.subscriptionEnd ? subscriber.subscriptionEnd.toISOString() : null,
        };
        console.log(`[SUB_CHECK_USING_EXPIRED_SUBSCRIBER_INFO] User ID: ${userId} - Using expired 'subscribers' table data. Response:`, response);
        return res.json(response);
      }
      
      // Step 4: If none of the above, return the initial default response
      console.log(`[SUB_CHECK_NO_ACTIVE_SUB_FOUND] User ID: ${userId} - No active subscription found. Returning default. Response:`, response);
      return res.json(response);

    } catch (error) {
      console.error(`[SUB_CHECK_ERROR] User ID: ${userId} - Error checking subscription:`, error);
      // Return the default response in case of an error during the checks
      // Potentially log more specific error or set a specific source for error cases
      response.source = 'error_during_check';
      res.status(500).json({ ...response, error: 'Failed to check subscription' });
    }
  });

  app.post('/api/customer-portal', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(400).json({ error: 'Stripe not configured' });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      // Get user profile to find Stripe customer ID
      const profile = await dbStorage.getProfile(req.userId!);
      if (!profile || !profile.email) {
        return res.status(400).json({ error: 'User profile not found' });
      }

      // Find or create Stripe customer
      let customer;
      const customers = await stripe.customers.list({
        email: profile.email!,
        limit: 1
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: profile.email!,
          name: profile.name || undefined
        });
      }

      // Create customer portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${req.headers.origin || 'http://localhost:5000'}/settings`
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Customer portal error:', error);
      res.status(500).json({ error: 'Failed to create customer portal session' });
    }
  });

  // Translation routes (ported from Supabase Edge Functions)
  app.post('/api/translate-text', async (req, res) => {
    try {
      const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Text and target language are required' });
      }
      
      // For now, return the original text - would integrate with Google Translate in production
      res.json({
        translatedText: text,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        message: 'Translation service not configured (mock)'
      });
    } catch (error) {
      res.status(500).json({ error: 'Translation failed' });
    }
  });

  // Photo upload routes with moderation
  app.post('/api/upload-photo', authenticateUser, upload.single('photo'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No photo provided' });
      }

      const userId = req.userId!;
      const { isProfilePhoto = false } = req.body;

      // Submit for moderation and compression
      const moderationRecord = await mediaModerationService.submitForModeration(
        userId,
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        isProfilePhoto
      );

      // Auto-approve for now (you can remove this when moderation is active)
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.SERVER_URL || 'https://2sweety.com')
        : `http://localhost:${process.env.PORT || 3000}`;
      
      const photoUrl = `${baseUrl}/uploads/compressed/${moderationRecord.fileName}`;
      
      // Update user's photos array in profile
      const profile = await dbStorage.getProfile(userId);
      if (profile) {
        const currentPhotos = profile.photos || [];
        const updatedPhotos = [...currentPhotos, photoUrl];
        
        await dbStorage.updateProfile(userId, {
          photos: updatedPhotos,
          updatedAt: new Date()
        });
      }

      res.json({ 
        success: true,
        moderationId: moderationRecord.id,
        status: 'pending_moderation',
        photoUrl: photoUrl,
        message: 'Photo uploaded successfully'
      });
    } catch (error) {
      console.error('Photo upload failed:', error);
      res.status(500).json({ error: 'Photo upload failed' });
    }
  });

  // Get user's approved photos
  app.get('/api/user-photos', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const approvedMedia = await mediaModerationService.getApprovedUserMedia(userId);
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.SERVER_URL || 'https://yourdomain.com'
        : `http://localhost:${process.env.PORT || 5000}`;
      
      const photos = approvedMedia
        .filter(media => media.fileType === 'image')
        .map(media => ({
          id: media.id,
          url: `${baseUrl}/${media.compressedPath || media.filePath}`,
          isProfilePhoto: media.isProfilePhoto,
          uploadedAt: media.uploadedAt,
          approvedAt: media.approvedAt
        }));
      
      res.json(photos);
    } catch (error) {
      console.error('Failed to get user photos:', error);
      res.status(500).json({ error: 'Failed to get user photos' });
    }
  });

  // Get user's media moderation status
  app.get('/api/user-media-status', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { status } = req.query;
      
      const mediaList = status 
        ? await mediaModerationService.getUserMediaByStatus(userId, status as 'pending' | 'approved' | 'rejected' | 'flagged')
        : await dbStorage.getUserMediaModeration(userId);
      
      res.json(mediaList);
    } catch (error) {
      console.error('Failed to get media status:', error);
      res.status(500).json({ error: 'Failed to get media status' });
    }
  });

  app.delete('/api/delete-photo', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { mediaId, photoUrl } = req.body;
      const userId = req.userId!;
      
      if (!mediaId && !photoUrl) {
        return res.status(400).json({ error: 'No media ID or photo URL provided' });
      }

      // Delete from media moderation if mediaId provided
      if (mediaId) {
        await mediaModerationService.deleteMedia(mediaId);
      }
      
      // Also remove from user's photos array
      if (photoUrl) {
        const profile = await dbStorage.getProfile(userId);
        if (profile && profile.photos) {
          const updatedPhotos = profile.photos.filter(p => p !== photoUrl);
          await dbStorage.updateProfile(userId, {
            photos: updatedPhotos,
            updatedAt: new Date()
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Photo deletion failed:', error);
      res.status(500).json({ error: 'Photo deletion failed' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if user has admin permissions
      const currentUser = await dbStorage.getProfile(userId);
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Get all users with minimal data for admin panel
      const users = await db.select({
        id: profiles.id,
        name: profiles.name,
        email: profiles.email,
        role: profiles.role,
        is_banned: profiles.isBanned,
        ban_reason: profiles.banReason,
        photos: profiles.photos,
        created_at: profiles.createdAt,
        updated_at: profiles.updatedAt,
        subscription_expires_at: profiles.subscriptionExpiresAt
      }).from(profiles).orderBy(profiles.createdAt);

      res.json(users);
    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/users/:targetUserId/role', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { targetUserId } = req.params;
      const { role } = req.body;

      console.log('🔧 [Server] Role update request:', { targetUserId, role, userId });

      if (!userId || !targetUserId || !role) {
        console.log('🔧 [Server] Missing data:', { userId: !!userId, targetUserId, role });
        return res.status(400).json({ error: 'Missing required data' });
      }

      // Get auth header to create user-scoped Supabase client
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Create Supabase client with user's token
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUser = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU',
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );

      // Validate role
      const validRoles = ['registered', 'silver', 'gold', 'platinum', 'moderator', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified' });
      }

      // Use RPC function to update role (this handles all security checks)
      const { data, error } = await supabaseUser.rpc('admin_update_user_role', {
        target_user_id: targetUserId,
        new_role: role
      });

      if (error) {
        console.error('Role update error:', error);
        
        // Handle specific error messages
        if (error.message.includes('Only admins can update user roles')) {
          return res.status(403).json({ error: 'Only admins can assign roles' });
        }
        if (error.message.includes('Cannot modify your own role')) {
          return res.status(403).json({ error: 'Cannot modify your own role' });
        }
        if (error.message.includes('User not found')) {
          return res.status(404).json({ error: 'Target user not found' });
        }
        
        return res.status(500).json({ error: error.message || 'Database error' });
      }

      console.log('✅ [Server] Role updated successfully:', { targetUserId, newRole: role });
      
      // Fetch updated user data
      const { data: updatedUser } = await supabaseUser
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
        
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Admin update role error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Moderator permissions management
  app.post('/api/admin/users/:targetUserId/permissions', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { targetUserId } = req.params;
      const { permissions } = req.body;

      console.log('🔧 [Server] Moderator permissions request:', { targetUserId, permissions, userId });

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify JWT token directly - we already have userId from authenticateUser middleware
      // Skip additional token verification since authenticateUser already validated it

      // Get auth header to create user-scoped Supabase client
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Create Supabase client with user's token
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUser = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU',
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );

      // SECURITY: Check if current user has admin permissions
      const { data: currentUser, error: userError } = await supabaseUser
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !currentUser || currentUser.role !== 'admin') {
        console.error('Permission assignment denied - not admin:', { userId, role: currentUser?.role });
        return res.status(403).json({ error: 'Only admins can assign moderator permissions' });
      }

      // SECURITY: Get target user to validate assignment
      const { data: targetUser, error: targetError } = await supabaseUser
        .from('profiles')
        .select('role')
        .eq('id', targetUserId)
        .single();

      if (targetError || !targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // SECURITY: Prevent self-permission assignment
      if (userId === targetUserId) {
        console.error('Self-permission assignment blocked:', { userId, targetUserId });
        return res.status(403).json({ error: 'Cannot assign permissions to yourself' });
      }

      // SECURITY: Validate target user can receive moderator permissions
      if (targetUser.role !== 'moderator') {
        console.error('Permission assignment to non-moderator blocked:', { 
          targetUserId, 
          targetRole: targetUser.role 
        });
        return res.status(403).json({ error: 'Can only assign permissions to moderators' });
      }

      // SECURITY: Validate each permission
      const validatedPermissions = permissions.filter((permission: string) => {
        const isValid = SecurityService.validateModeratorPermission(currentUser.role, permission);
        if (!isValid) {
          console.error('Invalid permission blocked:', { permission, assignerRole: currentUser.role });
        }
        return isValid;
      });

      if (validatedPermissions.length !== permissions.length) {
        console.error('Some permissions were invalid and filtered out');
        return res.status(400).json({ error: 'Some permissions are invalid' });
      }

      // Clear existing permissions for user
      const { error: deleteError } = await supabaseUser
        .from('moderator_permissions')
        .delete()
        .eq('user_id', targetUserId);

      if (deleteError) {
        console.error('Failed to clear existing permissions:', deleteError);
        return res.status(500).json({ error: 'Failed to update permissions' });
      }

      // Insert new validated permissions
      if (validatedPermissions && validatedPermissions.length > 0) {
        const permissionRecords = validatedPermissions.map((permission: string) => ({
          user_id: targetUserId,
          permission,
          granted_by: userId
        }));

        const { error: insertError } = await supabaseUser
          .from('moderator_permissions')
          .insert(permissionRecords);

        if (insertError) {
          console.error('Failed to insert permissions:', insertError);
          return res.status(500).json({ error: 'Failed to save permissions' });
        }
      }

      console.log('✅ [Server] Moderator permissions updated successfully');
      res.json({ success: true, permissions });
    } catch (error) {
      console.error('Moderator permissions error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get moderator permissions
  app.get('/api/admin/users/:targetUserId/permissions', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { targetUserId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get auth header to create user-scoped Supabase client
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Create Supabase client with user's token
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUser = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU',
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );

      // Check admin permissions
      const { data: currentUser, error: userError } = await supabaseUser
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Get user permissions
      const { data: permissions, error } = await supabaseUser
        .from('moderator_permissions')
        .select('permission')
        .eq('user_id', targetUserId);

      if (error) {
        console.error('Failed to get permissions:', error);
        return res.status(500).json({ error: 'Failed to get permissions' });
      }

      res.json({ permissions: permissions?.map((p: any) => p.permission) || [] });
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/users/:targetUserId/ban', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { targetUserId } = req.params;
      const { is_banned, ban_reason } = req.body;

      console.log('🔧 [Server] Ban request:', { targetUserId, is_banned, ban_reason });

      if (!userId || !targetUserId || typeof is_banned !== 'boolean') {
        console.log('🔧 [Server] Missing data:', { userId: !!userId, targetUserId, is_banned_type: typeof is_banned });
        return res.status(400).json({ error: 'Missing required data' });
      }

      // Use Supabase service role to bypass RLS restrictions
      const { createClient } = await import('@supabase/supabase-js');
      
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ error: 'Supabase service role key not configured' });
      }
      
      const supabaseAdmin = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // SECURITY: Check if current user has ban permissions
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !currentUser) {
        console.error('Failed to get current user role:', userError);
        return res.status(403).json({ error: 'User not found or insufficient permissions' });
      }

      // SECURITY: Get target user to validate ban action
      const { data: targetUser, error: targetError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', targetUserId)
        .single();

      if (targetError || !targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // SECURITY: Validate ban permission with monitoring
      if (!SecurityMonitor.validateAndLog(userId, currentUser.role, RESTRICTED_ACTIONS.BAN_USER, targetUserId, targetUser.role)) {
        console.error('Ban permission denied:', { userRole: currentUser.role });
        return res.status(403).json({ error: 'Insufficient permissions to ban users' });
      }

      // Update ban status using service role (bypasses RLS)
      const { data: updatedUser, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_banned: is_banned,
          ban_reason: is_banned ? (ban_reason || 'Banned by admin') : null
        })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) {
        console.error('Supabase admin ban update error:', error);
        return res.status(500).json({ error: `Database error: ${error.message}` });
      }

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('✅ [Server] Ban status updated successfully:', { targetUserId, is_banned });
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('🔧 [Server] Ban update error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.delete('/api/admin/users/:targetUserId', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { targetUserId } = req.params;

      if (!userId || !targetUserId) {
        return res.status(400).json({ error: 'Missing required data' });
      }

      // Use Supabase service role to bypass RLS restrictions
      const { createClient } = await import('@supabase/supabase-js');
      
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ error: 'Supabase service role key not configured' });
      }
      
      const supabaseAdmin = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // SECURITY: Check if current user has delete permissions
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !currentUser) {
        console.error('Failed to get current user role:', userError);
        return res.status(403).json({ error: 'User not found or insufficient permissions' });
      }

      // SECURITY: Get target user to validate deletion
      const { data: targetUser, error: targetError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', targetUserId)
        .single();

      if (targetError || !targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // SECURITY: Validate delete permission with monitoring
      if (!SecurityMonitor.validateAndLog(userId, currentUser.role, RESTRICTED_ACTIONS.DELETE_USER, targetUserId, targetUser.role)) {
        console.error('Delete permission denied:', { userRole: currentUser.role });
        return res.status(403).json({ error: 'Insufficient permissions to delete users' });
      }

      // Delete user using service role (bypasses RLS)
      const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', targetUserId);

      if (error) {
        console.error('Supabase admin delete error:', error);
        return res.status(500).json({ error: `Database error: ${error.message}` });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Admin delete user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/admin/users/:targetUserId/subscription', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { targetUserId } = req.params;
      const { role, durationDays } = req.body;

      if (!userId || !targetUserId || !role || !durationDays) {
        return res.status(400).json({ error: 'Missing required data' });
      }

      // Use Supabase service role to bypass RLS restrictions
      const { createClient } = await import('@supabase/supabase-js');
      
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceRoleKey) {
        return res.status(500).json({ error: 'Supabase service role key not configured' });
      }
      
      const supabaseAdmin = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // SECURITY: Check if current user has subscription management permissions
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !currentUser) {
        console.error('Failed to get current user role:', userError);
        return res.status(403).json({ error: 'User not found or insufficient permissions' });
      }

      // SECURITY: Validate subscription management permission
      if (!SecurityService.validatePermission(currentUser.role, RESTRICTED_ACTIONS.MANAGE_SUBSCRIPTION)) {
        console.error('Subscription management permission denied:', { userRole: currentUser.role });
        return res.status(403).json({ error: 'Insufficient permissions to manage subscriptions' });
      }

      // SECURITY: Validate subscription tier change
      if (!SecurityService.validateSubscriptionChange(currentUser.role, role)) {
        console.error('Invalid subscription change attempt:', { userRole: currentUser.role, targetRole: role });
        return res.status(403).json({ error: 'Invalid subscription tier change' });
      }

      // SECURITY: Prevent self-subscription modification
      if (userId === targetUserId) {
        console.error('Self-subscription modification attempt blocked:', { userId, targetUserId });
        return res.status(403).json({ error: 'Cannot modify your own subscription' });
      }

      // Calculate subscription expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      // Update user role and subscription using service role (bypasses RLS)
      const { data: updatedUser, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          role: role,
          subscription_expires_at: expiresAt.toISOString()
        })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) {
        console.error('Supabase admin subscription update error:', error);
        return res.status(500).json({ error: `Database error: ${error.message}` });
      }

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Admin grant subscription error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Media moderation admin routes
  app.get('/api/admin/moderation/pending', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check moderator/admin permissions
      const currentUser = await dbStorage.getProfile(userId);
      if (!currentUser || !['admin', 'moderator'].includes(currentUser.role!)) {
        return res.status(403).json({ error: 'Moderator access required' });
      }

      const pendingMedia = await mediaModerationService.getPendingModeration();
      
      // Include user info with each media item
      const enrichedMedia = await Promise.all(
        pendingMedia.map(async (media) => {
          const user = await dbStorage.getProfile(media.userId);
          return {
            ...media,
            user: {
              id: user?.id,
              name: user?.name,
              email: user?.email
            }
          };
        })
      );

      res.json(enrichedMedia);
    } catch (error) {
      console.error('Failed to get pending moderation:', error);
      res.status(500).json({ error: 'Failed to get pending moderation' });
    }
  });

  app.post('/api/admin/moderation/:mediaId/approve', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { mediaId } = req.params;
      const { notes } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check moderator/admin permissions
      const currentUser = await dbStorage.getProfile(userId);
      if (!currentUser || !['admin', 'moderator'].includes(currentUser.role!)) {
        return res.status(403).json({ error: 'Moderator access required' });
      }

      const result = await mediaModerationService.moderateContent(mediaId, userId, {
        id: mediaId,
        status: 'approved',
        notes
      });

      res.json({ success: true, result });
    } catch (error) {
      console.error('Failed to approve media:', error);
      res.status(500).json({ error: 'Failed to approve media' });
    }
  });

  app.post('/api/admin/moderation/:mediaId/reject', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { mediaId } = req.params;
      const { notes, reason } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check moderator/admin permissions
      const currentUser = await dbStorage.getProfile(userId);
      if (!currentUser || !['admin', 'moderator'].includes(currentUser.role!)) {
        return res.status(403).json({ error: 'Moderator access required' });
      }

      const result = await mediaModerationService.moderateContent(mediaId, userId, {
        id: mediaId,
        status: 'rejected',
        notes,
        flaggedReason: reason
      });

      res.json({ success: true, result });
    } catch (error) {
      console.error('Failed to reject media:', error);
      res.status(500).json({ error: 'Failed to reject media' });
    }
  });

  app.post('/api/admin/moderation/:mediaId/flag', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { mediaId } = req.params;
      const { notes, reason } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check moderator/admin permissions
      const currentUser = await dbStorage.getProfile(userId);
      if (!currentUser || !['admin', 'moderator'].includes(currentUser.role!)) {
        return res.status(403).json({ error: 'Moderator access required' });
      }

      const result = await mediaModerationService.moderateContent(mediaId, userId, {
        id: mediaId,
        status: 'flagged',
        notes,
        flaggedReason: reason
      });

      res.json({ success: true, result });
    } catch (error) {
      console.error('Failed to flag media:', error);
      res.status(500).json({ error: 'Failed to flag media' });
    }
  });

  // Get compression statistics
  app.get('/api/admin/compression-stats', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check admin permissions
      const currentUser = await dbStorage.getProfile(userId);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const stats = await mediaModerationService.getCompressionStats();
      res.json(stats);
    } catch (error) {
      console.error('Failed to get compression stats:', error);
      res.status(500).json({ error: 'Failed to get compression stats' });
    }
  });

  // Serve uploaded photos statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


  // Test service role endpoint
  app.get('/api/test-service-role', async (req, res) => {
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const anonKey = process.env.SUPABASE_ANON_KEY;
      
      if (!serviceRoleKey) {
        return res.json({ 
          error: 'No service role key in environment',
          envVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
        });
      }

      // Try to create client and query
      const { createClient } = await import('@supabase/supabase-js');
      
      // Test with anon key first
      const anonClient = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      const { count: anonCount, error: anonError } = await anonClient
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Now test with service role
      const testClient = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Test query
      const { data, error, count } = await testClient
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Also test a specific user query
      let profileTest = null;
      if (!error) {
        const { data: profile, error: profileError } = await testClient
          .from('profiles')
          .select('role')
          .eq('id', '90033e13-fc1d-487a-9090-645c67072b12')
          .single();
        profileTest = { profile, profileError };
      }

      return res.json({
        success: !error,
        keyLength: serviceRoleKey.length,
        keyPrefix: serviceRoleKey.substring(0, 20),
        keySuffix: serviceRoleKey.substring(serviceRoleKey.length - 10),
        anonTest: { count: anonCount, error: anonError },
        serviceRoleTest: { data, error: error ? error.message : null, count },
        profileTest,
        supabaseUrl: 'https://kvrlzpdyeezmhjiiwfnp.supabase.co'
      });
    } catch (error) {
      return res.json({ 
        error: getErrorMessage(error)
      });
    }
  });

  // Security monitoring dashboard endpoint
  app.get('/api/admin/security-dashboard', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check admin permissions
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !currentUser || currentUser.role !== 'admin') {
        SecurityMonitor.logSecurityEvent(userId, 'access_security_dashboard', 'denied', 'Not admin', 'high');
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      SecurityMonitor.logSecurityEvent(userId, 'access_security_dashboard', 'allowed', 'Admin access granted', 'low');
      const securityReport = SecurityMonitor.generateSecurityReport();
      res.json(securityReport);
    } catch (error) {
      console.error('Security dashboard error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Security events endpoint for real-time monitoring
  app.get('/api/admin/security-events', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { limit = 50, severity } = req.query;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check admin permissions
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !currentUser || currentUser.role !== 'admin') {
        SecurityMonitor.logSecurityEvent(userId, 'view_security_events', 'denied', 'Not admin', 'medium');
        return res.status(403).json({ error: 'Admin permissions required' });
      }

      let events;
      if (severity) {
        events = SecurityMonitor.getEventsBySeverity(severity as 'high' | 'low' | 'medium' | 'critical');
      } else {
        events = SecurityMonitor.getRecentEvents(Number(limit));
      }

      res.json({ events });
    } catch (error) {
      console.error('Security events error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Notification API routes
  app.get('/api/notifications', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { limit = 20 } = req.query;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const notifications = await NotificationService.getUserNotifications(userId, Number(limit));
      res.json({ notifications });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/notifications/unread-count', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const count = await NotificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Get notification count error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/notifications/:id/read', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await NotificationService.markAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/notifications/mark-all-read', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await NotificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Admin stats endpoint with service role access
  app.get('/api/admin/stats', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log('Admin stats request for user:', userId);

      // Get auth token from request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Create Supabase client with user's token
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseClient = createClient(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU',
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );

      // Check if user is admin
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      console.log('Profile check:', { profile, error: profileError });

      if (profileError || !profile || profile.role !== 'admin') {
        console.error('Access denied:', { profileError, profile, role: profile?.role });
        return res.status(403).json({ error: 'Access denied' });
      }

      // Since we can't use service role, we'll get stats that are accessible via RLS
      // For a proper solution, you would need to create RLS policies that allow admins to see all data
      
      // Get total users (admins should be able to see all profiles with proper RLS)
      const { count: totalUsers } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', sevenDaysAgo.toISOString());

      // Get premium users
      const { count: premiumUsers } = await supabaseClient
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      // Get total revenue - this might be limited by RLS
      const { data: payments } = await supabaseClient
        .from('payments')
        .select('amount')
        .eq('status', 'succeeded');

      const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      return res.json({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers || 0,
        totalRevenue: totalRevenue / 100 // Convert from cents to dollars
      });

    } catch (error) {
      console.error('Admin stats error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
