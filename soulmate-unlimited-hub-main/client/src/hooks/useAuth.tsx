import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { User, Session, AuthError, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  userPermissions: string[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error?: AuthError | null }>;
  signInWithApple: () => Promise<{ error?: AuthError | null }>;
  signInWithFacebook: () => Promise<{ error?: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  isModerator: boolean;
  hasProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  const loadUserRoleFromDatabase = async (user: User) => {
    try {
      logger.auth('Loading role from database for user:', user?.email);
      
      // Check if user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, age')
        .eq('id', user.id)
        .single();
      
      setHasProfile(!!(profile?.name && profile?.age));
      
      // Get real role from database via roleService
      const dbRole = await roleService.getCurrentUserRole();
      
      if (dbRole) {
        logger.auth('Database role found:', dbRole);
        setUserRole(dbRole);
        
        // Load permissions based on role using roleService
        const permissions = roleService.getUserPermissions(dbRole);
        setUserPermissions(permissions);
        
        // Also load permissions via permissionService for additional features
        await permissionService.loadUserPermissions(user.id);
        
        logger.auth('Role and permissions loaded:', {
          userId: user.id,
          role: dbRole,
          permissions
        });
      } else {
        logger.warn('No role found in database, defaulting to registered');
        setUserRole('registered');
        setUserPermissions(['view_profiles', 'send_messages']);
      }
    } catch (error) {
      logger.error('Error loading user role from database:', error);
      // Fallback to registered role
      setUserRole('registered');
      setUserPermissions(['view_profiles', 'send_messages']);
    }
  };

  const refreshSession = async () => {
    try {
      logger.auth('Refreshing session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Session refresh error:', error);
        
        // Try to get a new session for Google/OAuth users
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession) {
          logger.auth('Got new session after refresh error');
          setSession(newSession);
          setUser(newSession.user);
          if (newSession.user) {
            await loadUserRoleFromDatabase(newSession.user);
          }
        }
        return;
      }

      logger.auth('Session refreshed successfully');
      if (session) {
        setSession(session);
        setUser(session.user);
        if (session.user) {
          await loadUserRoleFromDatabase(session.user);
        }
      }
    } catch (error) {
      logger.error('Session refresh failed:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    // Admin users with "all_permissions" can access everything
    if (userPermissions.includes('all_permissions')) {
      return true;
    }
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || isAdmin;

  const signIn = async (email: string, password: string) => {
    try {
      logger.auth('Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Sign in error:', error);
        return { error };
      }

      logger.auth('Sign in successful');
      return { error: null };
    } catch (error) {
      logger.error('Sign in failed:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      logger.auth('Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || ''
          }
        }
      });

      if (error) {
        logger.error('Sign up error:', error);
        return { error };
      }

      logger.auth('Sign up successful');
      return { error: null };
    } catch (error) {
      logger.error('Sign up failed:', error);
      return { error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Signing in with Google');
      // Fix redirect URL for OAuth
      const redirectUrl = window.location.origin;
      console.log('🔐 OAuth redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        console.error('🔐 Google sign in error:', error);
        throw error;
      }

      console.log('🔐 Google sign in initiated');
      return { error: null };
    } catch (error) {
      console.error('🔐 Google sign in failed:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('🔐 Signing in with Apple');
      const redirectUrl = window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('🔐 Apple sign in error:', error);
        throw error;
      }

      console.log('🔐 Apple sign in initiated');
      return { error: null };
    } catch (error) {
      console.error('🔐 Apple sign in failed:', error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      console.log('🔐 Signing in with Facebook');
      const redirectUrl = window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('🔐 Facebook sign in error:', error);
        throw error;
      }

      console.log('🔐 Facebook sign in initiated');
      return { error: null };
    } catch (error) {
      console.error('🔐 Facebook sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('🔧 [useAuth] Sign out error:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupRealtimeSubscriptions = async (currentUser: User) => {
      if (!isMounted) return;
      
      console.log(`🔧 [useAuth] Setting up realtime subscriptions for user: ${currentUser.id}`);

      // Use unique channel names to prevent conflicts
      const userChannelName = `auth_user_${currentUser.id}_${Date.now()}`;
      const rolesChannelName = `auth_roles_${Date.now()}`;

      try {
        const userChannel = supabase
          .channel(userChannelName)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.id}` }, async (payload) => {
            if (!isMounted) return;
            console.log('🔧 [useAuth] Profile update received, reloading role.', payload.new);
            await loadUserRoleFromDatabase(currentUser);
          })
          .subscribe((status, err) => {
            if (!isMounted) return;
            if (status === 'SUBSCRIBED') {
              console.log(`🔧 [useAuth] Subscribed to user channel: ${currentUser.id}`);
            }
            if (err) {
              console.error(`[useAuth] Error subscribing to user channel:`, err);
            }
          });
        
        const rolesChannel = supabase
          .channel(rolesChannelName)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, async () => {
            if (!isMounted) return;
            console.log('🔧 [useAuth] Role change detected, reloading role.');
            const { data: { user } } = await supabase.auth.getUser();
            if (user && isMounted) {
              await loadUserRoleFromDatabase(user);
            }
          })
          .subscribe((status, err) => {
            if (!isMounted) return;
            if (status === 'SUBSCRIBED') {
              console.log(`🔧 [useAuth] Subscribed to roles_permissions channel.`);
            }
            if (err) {
              console.error(`[useAuth] Error subscribing to roles channel:`, err);
            }
          });

        if (isMounted) {
          channelsRef.current = [userChannel, rolesChannel];
        }
      } catch (error) {
        console.error('🔧 [useAuth] Error setting up subscriptions:', error);
      }
    };

    const clearRealtimeSubscriptions = async () => {
      if (channelsRef.current.length > 0) {
        console.log('🔧 [useAuth] Removing realtime subscriptions.');
        try {
          await Promise.all(channelsRef.current.map(channel => supabase.removeChannel(channel)));
          channelsRef.current = [];
        } catch (error) {
          console.error('🔧 [useAuth] Error removing subscriptions:', error);
          channelsRef.current = [];
        }
      }
    };

    const handleAuthStateChange = async (event: string, newSession: Session | null) => {
      if (!isMounted) return;
      
      console.log(`🔧 [useAuth] Auth state change event: ${event}`);
      setIsLoading(true);
      
      try {
        await clearRealtimeSubscriptions();
        
        const currentUser = newSession?.user ?? null;
        setSession(newSession);
        setUser(currentUser);

        if (currentUser && isMounted) {
          await loadUserRoleFromDatabase(currentUser);
          await setupRealtimeSubscriptions(currentUser);
        } else {
          setUserRole(null);
          setUserPermissions([]);
          setHasProfile(false);
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('🔧 [useAuth] Error initializing auth:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        handleAuthStateChange(event, session);
      }
    });

    // Set up periodic session refresh for OAuth users (every 30 minutes)
    const refreshInterval = setInterval(async () => {
      if (!isMounted) return;
      
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession && isMounted) {
          console.log('🔧 [useAuth] Periodic session refresh');
          await refreshSession();
        }
      } catch (error) {
        console.error('🔧 [useAuth] Error during periodic refresh:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      console.log('🔧 [useAuth] Cleaning up auth provider.');
      isMounted = false;
      subscription?.unsubscribe();
      clearRealtimeSubscriptions();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const value = {
    user,
    session,
    userRole,
    userPermissions,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signInWithFacebook,
    signOut,
    refreshSession,
    hasPermission,
    hasRole,
    isAdmin,
    isModerator,
    hasProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
