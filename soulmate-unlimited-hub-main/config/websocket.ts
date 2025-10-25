import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisPub, redisSub } from './redis';
import { Pool } from 'pg';
import { supabase } from '../client/src/integrations/supabase/client';

// PostgreSQL client for LISTEN/NOTIFY
const pgPool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL || 'postgresql://sweety_user:sweety_secure_password_2024@localhost:5432/sweety_db',
});

interface SocketData {
  userId: string;
  sessionId: string;
}

export class WebSocketServer {
  private io: SocketServer;
  private pgClient: any;
  private notificationHandlers: Map<string, (payload: any) => void>;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    // Use Redis adapter for scaling
    this.io.adapter(createAdapter(redisPub, redisSub));

    this.notificationHandlers = new Map();
    this.setupNotificationHandlers();
    this.setupSocketHandlers();
    this.initializePostgresListener();
  }

  private async initializePostgresListener() {
    try {
      this.pgClient = await pgPool.connect();
      
      // Listen to all channels
      const channels = [
        'profile_changes',
        'new_message',
        'new_match',
        'new_guest',
        'super_like',
        'profile_view',
        'call_signal'
      ];

      for (const channel of channels) {
        await this.pgClient.query(`LISTEN ${channel}`);
      }

      // Handle notifications
      this.pgClient.on('notification', (msg: any) => {
        console.log('PostgreSQL notification:', msg.channel, msg.payload);
        
        const handler = this.notificationHandlers.get(msg.channel);
        if (handler) {
          try {
            const payload = JSON.parse(msg.payload);
            handler(payload);
          } catch (error) {
            console.error('Error parsing notification payload:', error);
          }
        }
      });

      console.log('✅ PostgreSQL LISTEN/NOTIFY initialized');
    } catch (error) {
      console.error('❌ PostgreSQL listener error:', error);
      // Retry connection
      setTimeout(() => this.initializePostgresListener(), 5000);
    }
  }

  private setupNotificationHandlers() {
    // Profile changes
    this.notificationHandlers.set('profile_changes', (payload) => {
      const { user_id, data } = payload;
      this.io.to(`user:${user_id}`).emit('profile:update', data);
    });

    // New messages
    this.notificationHandlers.set('new_message', (payload) => {
      const { conversation_id, sender_id, message } = payload;
      // Emit to conversation room
      this.io.to(`conversation:${conversation_id}`).emit('message:new', message);
    });

    // New matches
    this.notificationHandlers.set('new_match', (payload) => {
      const { user_id, matched_with, match_id } = payload;
      this.io.to(`user:${user_id}`).emit('match:new', {
        matchedWith: matched_with,
        matchId: match_id,
      });
    });

    // New guests (likes)
    this.notificationHandlers.set('new_guest', (payload) => {
      const { user_id, guest_id, created_at } = payload;
      this.io.to(`user:${user_id}`).emit('guest:new', {
        guestId: guest_id,
        createdAt: created_at,
      });
    });

    // Super likes
    this.notificationHandlers.set('super_like', (payload) => {
      const { to_user_id, from_user_id, created_at } = payload;
      this.io.to(`user:${to_user_id}`).emit('superlike:new', {
        fromUserId: from_user_id,
        createdAt: created_at,
      });
    });

    // Profile views
    this.notificationHandlers.set('profile_view', (payload) => {
      const { viewed_id, viewer_id, created_at } = payload;
      this.io.to(`user:${viewed_id}`).emit('profile:viewed', {
        viewerId: viewer_id,
        createdAt: created_at,
      });
    });

    // Call signals
    this.notificationHandlers.set('call_signal', (payload) => {
      const { receiver_id, caller_id, call_type, status, session_id } = payload;
      this.io.to(`user:${receiver_id}`).emit('call:signal', {
        callerId: caller_id,
        callType: call_type,
        status,
        sessionId: session_id,
      });
    });
  }

  private setupSocketHandlers() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          return next(new Error('Invalid authentication'));
        }

        // Attach user data to socket
        (socket.data as SocketData).userId = user.id;
        (socket.data as SocketData).sessionId = socket.id;

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      const userId = (socket.data as SocketData).userId;
      console.log(`User ${userId} connected with socket ${socket.id}`);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Handle joining conversation rooms
      socket.on('conversation:join', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
      });

      // Handle leaving conversation rooms
      socket.on('conversation:leave', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${userId} left conversation ${conversationId}`);
      });

      // Handle typing indicators
      socket.on('typing:start', (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit('typing:start', {
          userId,
          conversationId,
        });
      });

      socket.on('typing:stop', (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit('typing:stop', {
          userId,
          conversationId,
        });
      });

      // Handle WebRTC signaling
      socket.on('webrtc:offer', (data: { to: string; offer: any }) => {
        this.io.to(`user:${data.to}`).emit('webrtc:offer', {
          from: userId,
          offer: data.offer,
        });
      });

      socket.on('webrtc:answer', (data: { to: string; answer: any }) => {
        this.io.to(`user:${data.to}`).emit('webrtc:answer', {
          from: userId,
          answer: data.answer,
        });
      });

      socket.on('webrtc:ice-candidate', (data: { to: string; candidate: any }) => {
        this.io.to(`user:${data.to}`).emit('webrtc:ice-candidate', {
          from: userId,
          candidate: data.candidate,
        });
      });

      // Handle presence updates
      socket.on('presence:update', (status: 'online' | 'away' | 'offline') => {
        // Broadcast to all connected users (or specific rooms)
        socket.broadcast.emit('presence:update', {
          userId,
          status,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        
        // Notify others about offline status
        socket.broadcast.emit('presence:update', {
          userId,
          status: 'offline',
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  // Graceful shutdown
  public async close() {
    if (this.pgClient) {
      await this.pgClient.release();
    }
    this.io.close();
    console.log('WebSocket server closed');
  }

  // Get Socket.IO instance (for external use)
  public getIO() {
    return this.io;
  }
}

// Export factory function
export function createWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  return new WebSocketServer(httpServer);
}