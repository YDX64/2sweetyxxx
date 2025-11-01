import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  MapPin,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Heart,
  Ruler,
  Wine,
  Cigarette,
  Dumbbell,
  Baby,
  Shield,
  Globe,
  Ban,
  UserCheck,
  Activity,
  Sun,
  Moon,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  User,
  MessageCircle,
  Crown,
  Settings,
  Lock
} from "lucide-react";
import { format } from "date-fns";
import { tr, enUS, sv } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { UserRole, ROLE_INFO } from "@/types/roles";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/adminService";

interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  location?: string | null;
  bio?: string | null;
  interests?: string[] | null;
  languages?: string[] | null;
  occupation?: string | null;
  education?: string | null;
  height?: number | null;
  religion?: string | null;
  zodiac_sign?: string | null;
  drinking?: string | null;
  smoking?: string | null;
  exercise?: string | null;
  relationship_type?: string | null;
  children?: string | null;
  photos?: string[] | null;
  role?: UserRole | null;
  is_banned?: boolean | null;
  ban_reason?: string | null;
  subscription_tier?: string | null;
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
  created_at: string;
  updated_at: string;
  last_seen?: string | null;
  ip_address?: string | null;
  last_ip_address?: string | null;
  is_online?: boolean | null;
  last_activity?: string | null;
  // Discovery preferences
  show_me?: string | null;
  age_min?: number | null;
  age_max?: number | null;
  max_distance?: number | null;
  // Privacy settings
  profile_visibility?: string | null;
  show_distance?: boolean | null;
  show_age?: boolean | null;
  show_online_status?: boolean | null;
  show_last_seen?: boolean | null;
  // Additional admin fields
  [key: string]: unknown;
}

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalMatches: 0,
    totalMessages: 0,
    totalLikes: 0,
    profileViews: 0
  });
  
  // Photo modal states
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [matches, setMatches] = useState<Array<{
    id: string;
    created_at: string;
    user1_id: string;
    user2_id: string;
    matched_user?: { id: string; name?: string; photos?: string[] };
  }>>([]);
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    conversation_id: string;
  }>>([]);
  const [likes, setLikes] = useState<Array<{
    id: string;
    created_at: string;
    target_user_id: string;
    user_id: string;
  }>>([]);
  
  // Admin functionality states
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionRole, setSubscriptionRole] = useState('silver');
  const [subscriptionDuration, setSubscriptionDuration] = useState('30');
  
  // Role change confirmation states
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [roleChangeReason, setRoleChangeReason] = useState('');
  
  // Moderation states
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [customBanReason, setCustomBanReason] = useState('');
  
  // Permission states
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);

      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as string)
        .single();

      if (userError) throw userError;
      setUser(userData);

      // Load matches data
      try {
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            id,
            created_at,
            user1_id,
            user2_id,
            user1:profiles!matches_user1_id_fkey(id, name, photos),
            user2:profiles!matches_user2_id_fkey(id, name, photos)
          `)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        if (!matchesError && matchesData) {
          const formattedMatches = matchesData.map(match => ({
            ...match,
            matched_user: {
              id: match.user1_id === userId ? match.user2.id : match.user1.id,
              name: match.user1_id === userId ? match.user2.name || undefined : match.user1.name || undefined,
              photos: match.user1_id === userId ? match.user2.photos || undefined : match.user1.photos || undefined
            }
          }));
          setMatches(formattedMatches);
          setUserStats(prev => ({ ...prev, totalMatches: matchesData.length }));
        }
      } catch (error) {
        console.error('Error loading matches:', error);
        setMatches([]);
      }

      // Load super likes given by this user
      try {
        const { data: likesData, error: likesError } = await supabase
          .from('super_likes')
          .select('*')
          .eq('user_id', userId as string);

        if (!likesError && likesData) {
          setLikes(likesData);
          setUserStats(prev => ({ ...prev, totalLikes: likesData.length }));
        }
      } catch (error) {
        console.error('Error loading likes:', error);
        setLikes([]);
      }

      // Load messages data
      try {
        // First get conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('id')
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

        if (!conversationsError && conversationsData) {
          const conversationIds = conversationsData.map(c => c.id);
          
          if (conversationIds.length > 0) {
            // Get messages from all conversations
            const { data: messagesData, error: messagesError } = await supabase
              .from('messages')
              .select('*')
              .in('conversation_id', conversationIds)
              .eq('sender_id', userId as string)
              .order('created_at', { ascending: false })
              .limit(50);
            
            if (!messagesError && messagesData) {
              setMessages(messagesData);
              setUserStats(prev => ({ ...prev, totalMessages: messagesData.length }));
            }
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: t('errorToast'),
        description: t('loadingError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userId, t]); // ✅ All dependencies declared

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId, loadUserData]); // ✅ All dependencies declared

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'tr': return tr;
      case 'sv': return sv;
      default: return enUS;
    }
  };

  const getRoleBadge = (role?: UserRole) => {
    const userRole = role || 'registered';
    const roleInfo = ROLE_INFO[userRole];

    // Çeviri yüklenemediğinde bile bir Görünen Ad (DisplayName) olduğundan emin ol
    const displayName = t(`role.${userRole}.displayName`, roleInfo.displayName);
    
    return (
      <Badge className={`bg-gradient-to-r ${roleInfo.bgGradient} text-white border-0`}>
        {displayName}
      </Badge>
    );
  };

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const openPhotoModal = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
  };

  const nextPhoto = () => {
    if (user?.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % user.photos!.length);
    }
  };

  const prevPhoto = () => {
    if (user?.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + user.photos!.length) % user.photos!.length);
    }
  };

  // Use server-side API for reliable ban operations
  const handleBanToggle = async () => {
    if (!user) return;
    
    try {
      const newBanStatus = !user.is_banned;
      
      // Use server-side admin API to bypass RLS restrictions
      const response = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          is_banned: newBanStatus,
          ban_reason: newBanStatus ? 'Banned by admin' : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update ban status');
      }
      
      // Update local state immediately for better UX
      setUser(prev => prev ? {
        ...prev,
        is_banned: newBanStatus,
        ban_reason: newBanStatus ? 'Banned by admin' : null
      } : null);
      
      // Reload fresh data after a delay
      setTimeout(() => loadUserData(), 1000);
      
      toast({
        title: newBanStatus ? 'Kullanıcı Yasaklandı' : 'Yasak Kaldırıldı',
        description: newBanStatus ? 'Kullanıcı başarıyla yasaklandı' : 'Kullanıcının yasağı kaldırıldı',
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      });
    } catch (error: unknown) {
      console.error('Error updating ban status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast({
        title: 'Hata',
        description: `Yasak durumu güncellenemedi: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // State for role update loading
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const handleRoleChange = async (newRole: UserRole) => {
    if (!user || !userId) return;
    
    // Show confirmation dialog for admin/moderator roles
    if (newRole === 'admin' || newRole === 'moderator') {
      setPendingRole(newRole);
      setShowRoleChangeDialog(true);
      return;
    }
    
    // Direct update for registered role
    await executeRoleChange(newRole);
  };

  const executeRoleChange = async (newRole: UserRole) => {
    if (!user || !userId) return;
    
    setUpdatingRole(newRole);
    
    try {
      await adminService.updateUserRole(userId, newRole);
      
      setUser(prev => prev ? { ...prev, role: newRole } : null);

      toast({
        title: 'Role Updated Successfully',
        description: `User role changed to ${newRole.toUpperCase()}`,
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      });

      setTimeout(() => loadUserData(), 500);
      
    } catch (error: unknown) {
      console.error('Role change error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred';
      toast({
        title: 'Role Update Failed',
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const confirmRoleChange = async () => {
    if (!pendingRole || !user || !userId) return;
    
    await executeRoleChange(pendingRole);
    
    setShowRoleChangeDialog(false);
    setPendingRole(null);
    setRoleChangeReason('');
  };

  const handleBanUser = async (reason: string) => {
    if (!user?.id) return;
    
    setBanReason(reason);
    setShowBanDialog(true);
  };

  const confirmBanUser = async () => {
    if (!user?.id) return;
    
    const finalReason = banReason === 'custom' ? customBanReason : banReason;
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          is_banned: true,
          ban_reason: finalReason
        })
      });

      if (!response.ok) throw new Error('Failed to ban user');
      
      setUser(prev => prev ? {
        ...prev,
        is_banned: true,
        ban_reason: finalReason
      } : null);

      toast({
        title: 'User Banned',
        description: `User has been banned for: ${finalReason}`,
        className: "bg-red-500/10 text-red-600 border-red-500/20",
      });
      
      setShowBanDialog(false);
      setBanReason('');
      setCustomBanReason('');
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to ban user.',
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(t('confirmDeleteUser'));
    if (!confirmed) return;
    
    try {
      // Soft delete approach - ban user and mark as deleted
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          ban_reason: 'Account deleted by admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: 'Kullanıcı Silindi',
        description: 'Kullanıcı hesabı deaktive edildi',
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      });
      
      // Navigate back to admin panel
      navigate('/admin');
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast({
        title: 'Hata',
        description: `Kullanıcı silinemedi: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const handleSubscriptionUpdate = async (newTier: UserRole, durationDays: number) => {
    if (!user || !userId) return;
    
    try {
      setSubscriptionLoading(true);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + durationDays);
      
      const updateData = {
        role: newTier, // Update role directly
        subscription_expires_at: expirationDate.toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (error) throw error;
      
      setUser(prev => prev ? { ...prev, ...updateData } : null);
      
      toast({
        title: '✨ Abonelik Başarıyla Aktive Edildi',
        description: `${newTier.toUpperCase()} planı ${durationDays} gün boyunca aktive edildi.`,
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      });
    } catch (error: unknown) {
      console.error('Abonelik güncellenirken hata:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast({
        title: 'Abonelik Güncelleme Başarısız',
        description: `Abonelik aktive edilemedi: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleQuickSubscriptionUpdate = async () => {
    const durationDays = parseInt(subscriptionDuration);
    await handleSubscriptionUpdate(subscriptionRole as UserRole, durationDays);
  };



  const handleDeleteAllPhotos = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          photos: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser(prev => prev ? {
        ...prev,
        photos: []
      } : null);

      toast({
        title: 'Photos Deleted',
        description: 'All user photos have been deleted.',
        className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      });
    } catch (error) {
      console.error('Error deleting photos:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete photos.',
        variant: "destructive"
      });
    }
  };

  const handleResetProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: null,
          interests: [],
          photos: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser(prev => prev ? {
        ...prev,
        bio: null,
        interests: [],
        photos: []
      } : null);

      toast({
        title: 'Profile Reset',
        description: 'User profile has been reset.',
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      });
    } catch (error) {
      console.error('Error resetting profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset profile.',
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-gray-800">{t('loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-gray-800">{t('userNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Main Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">User Management</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* User Panel Sub-Header */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photos?.[0]} />
                    <AvatarFallback className="text-xs">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium text-gray-800 dark:text-gray-100">
                      {user.name || 'Unknown User'}
                      {user.age && <span className="text-gray-600 dark:text-gray-400 font-normal"> ({user.age})</span>}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getRoleBadge(user.role || undefined)}
                {user.is_online && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Online
                  </Badge>
                )}
                {user.is_banned && (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                    <Ban className="w-3 h-3 mr-1" />
                    Banned
                  </Badge>
                )}
                
                <Button
                  onClick={handleBanToggle}
                  variant={user.is_banned ? "default" : "destructive"}
                  size="sm"
                  className={user.is_banned ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {user.is_banned ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Unban User
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Photo */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg">
              <CardContent className="p-0">
                <div 
                  className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openPhotoModal(0)}
                >
                  <img
                    src={user.photos?.[0] || '/placeholder.svg'}
                    alt={user.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {user.is_online ? (
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    ) : (
                      <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>
                
                {/* Additional Photos */}
                {user.photos && user.photos.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {user.photos.slice(1, 4).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Photo ${index + 2}`}
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openPhotoModal(index + 1)}
                        />
                      ))}
                    </div>
                    {user.photos.length > 4 && (
                      <div className="mt-2 text-center">
                        <button
                          onClick={() => openPhotoModal(4)}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                          +{user.photos.length - 4} daha fazla
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Actions */}
            <Card className="bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Admin Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                    <span className="font-mono text-xs text-gray-800 dark:text-gray-200">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-gray-800 dark:text-gray-200">{user.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-800 dark:text-gray-200">{user.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                    <span className="font-mono text-xs text-gray-800 dark:text-gray-200">{user.ip_address || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last IP:</span>
                    <span className="font-mono text-xs text-gray-800 dark:text-gray-200">{user.last_ip_address || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {format(new Date(user.created_at), 'dd MMM yyyy', { locale: getDateLocale() })}
                    </span>
                  </div>
                  {user.last_activity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {format(new Date(user.last_activity), 'dd MMM yyyy HH:mm', { locale: getDateLocale() })}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Admin Action Buttons */}
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Admin Actions</h4>
                  
                  {/* Current Status */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400">Current Role:</label>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role || undefined)}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {user.subscription_expires_at && (
                          <>Expires {format(new Date(user.subscription_expires_at), 'dd MMM yyyy', { locale: getDateLocale() })}</>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Danger Zone */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <label className="text-xs text-red-600 dark:text-red-400 font-medium">Danger Zone:</label>
                    <div className="mt-2">
                      <Button
                        onClick={handleDeleteUser}
                        size="sm"
                        variant="destructive"
                        className="text-xs w-full"
                      >
                        Delete User Permanently
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Info */}
            <Card className="bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                      {user.name || 'Unknown User'}
                      {user.age && <span className="text-2xl font-normal text-gray-600 dark:text-gray-400">, {user.age}</span>}
                    </h1>
                    {user.location && (
                      <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* About Section */}
                {user.bio && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">About</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Interests */}
                {user.interests && user.interests.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, index) => (
                        <Badge 
                          key={index} 
                          className="bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800 hover:bg-pink-200 dark:hover:bg-pink-900/70 px-3 py-1"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card className="bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Personal Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  
                  {user.zodiac_sign && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Zodiac</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.zodiac_sign}</p>
                      </div>
                    </div>
                  )}

                  {user.education && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Education</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.education}</p>
                      </div>
                    </div>
                  )}

                  {user.occupation && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Job</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.occupation}</p>
                      </div>
                    </div>
                  )}

                  {user.height && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700/80 rounded-full flex items-center justify-center">
                        <Ruler className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.height} cm</p>
                      </div>
                    </div>
                  )}

                  {user.drinking && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <Wine className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Drinking</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.drinking}</p>
                      </div>
                    </div>
                  )}

                  {user.smoking && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Cigarette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Smoking</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.smoking}</p>
                      </div>
                    </div>
                  )}

                  {user.exercise && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700/80 rounded-full flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Exercise</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.exercise}</p>
                      </div>
                    </div>
                  )}

                  {user.children && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                        <Baby className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Children</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.children}</p>
                      </div>
                    </div>
                  )}

                  {user.languages && user.languages.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Languages</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.languages.join(', ')}</p>
                      </div>
                    </div>
                  )}

                  {user.relationship_type && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Looking for</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.relationship_type}</p>
                      </div>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>

            {/* Ban Reason (if banned) */}
            {user.is_banned && user.ban_reason && (
              <Card className="bg-red-50 border-red-200 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
                    <Ban className="w-5 h-5 mr-2" />
                    Ban Reason
                  </h2>
                  <p className="text-red-700">{user.ban_reason}</p>
                </CardContent>
              </Card>
            )}

            {/* Detailed Admin Tabs */}
            <Card className="bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg">
              <CardContent className="p-6">
                <Tabs defaultValue="activity" className="w-full">
                  {/* Full-Width Enhanced Tabs Navigation */}
                  <div className="w-full mb-6">
                    <TabsList className="w-full h-auto bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-1 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 w-full">
                        
                        {/* Activity Tab */}
                        <TabsTrigger 
                          value="activity" 
                          className="group relative flex items-center justify-center py-4 px-3 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-md"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">
                              Activity
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                        </TabsTrigger>
                        
                        {/* Matches Tab */}
                        <TabsTrigger 
                          value="matches" 
                          className="group relative flex items-center justify-center py-4 px-3 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-md"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400 group-data-[state=active]:text-pink-700 dark:group-data-[state=active]:text-pink-300" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">
                              Matches
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-pink-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                        </TabsTrigger>
                        
                        {/* Messages Tab */}
                        <TabsTrigger 
                          value="messages" 
                          className="group relative flex items-center justify-center py-4 px-3 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-md"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <Mail className="w-5 h-5 text-green-600 dark:text-green-400 group-data-[state=active]:text-green-700 dark:group-data-[state=active]:text-green-300" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">
                              <span className="hidden sm:inline">Messages</span>
                              <span className="sm:hidden">Msg</span>
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                        </TabsTrigger>
                        
                        {/* Role & Subscription Tab */}
                        <TabsTrigger 
                          value="subscription" 
                          className="group relative flex items-center justify-center py-4 px-3 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-md"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 group-data-[state=active]:text-yellow-700 dark:group-data-[state=active]:text-yellow-300" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white text-center leading-tight">
                              <span className="hidden lg:inline">Role & Sub</span>
                              <span className="lg:hidden hidden sm:inline">Role</span>
                              <span className="sm:hidden">R&S</span>
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-yellow-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                        </TabsTrigger>
                        
                        {/* Moderation Tab */}
                        <TabsTrigger 
                          value="moderation" 
                          className="group relative flex items-center justify-center py-4 px-3 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-md"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <Shield className="w-5 h-5 text-red-600 dark:text-red-400 group-data-[state=active]:text-red-700 dark:group-data-[state=active]:text-red-300" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">
                              <span className="hidden sm:inline">Moderation</span>
                              <span className="sm:hidden">Mod</span>
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-red-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                        </TabsTrigger>
                        
                        {/* Preferences Tab */}
                        <TabsTrigger 
                          value="preferences" 
                          className="group relative flex items-center justify-center py-4 px-3 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-md"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 group-data-[state=active]:text-purple-700 dark:group-data-[state=active]:text-purple-300" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">
                              <span className="hidden sm:inline">Preferences</span>
                              <span className="sm:hidden">Pref</span>
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                        </TabsTrigger>
                        
                        {/* Security Tab */}
                        <TabsTrigger 
                          value="security" 
                          className="group relative flex items-center justify-center py-4 px-3 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:shadow-md"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 group-data-[state=active]:text-orange-700 dark:group-data-[state=active]:text-orange-300" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">
                              <span className="hidden sm:inline">Security</span>
                              <span className="sm:hidden">Sec</span>
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                        </TabsTrigger>
                        
                      </div>
                    </TabsList>
                  </div>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">User Activity Overview</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="font-semibold text-green-800 dark:text-green-300">Total Matches</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{userStats.totalMatches}</p>
                          <p className="text-sm text-green-600 dark:text-green-500">Mutual likes</p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-blue-800 dark:text-blue-300">Messages Sent</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{userStats.totalMessages}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-500">Total conversations</p>
                        </div>
                        
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/50">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="font-semibold text-purple-800 dark:text-purple-300">Profile Views</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">N/A</p>
                          <p className="text-sm text-purple-600 dark:text-purple-500">Times viewed</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Recent Activity</h4>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 dark:text-gray-300">Profile created</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {format(new Date(user.created_at), 'dd MMM yyyy HH:mm', { locale: getDateLocale() })}
                              </span>
                            </div>
                          </div>
                          {user.last_activity && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">Last activity</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {format(new Date(user.last_activity), 'dd MMM yyyy HH:mm', { locale: getDateLocale() })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Matches Tab */}
                  <TabsContent value="matches" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Matches & Likes</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Mutual Matches ({matches.length})</h4>
                          <div className="space-y-2">
                            {matches.length > 0 ? (
                              matches.slice(0, 5).map((match) => (
                                <div key={match.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={match.matched_user?.photos?.[0]} />
                                      <AvatarFallback className="text-xs">
                                        {match.matched_user?.name?.[0]?.toUpperCase() || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                        {match.matched_user?.name || 'Unknown User'}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(match.created_at), 'dd MMM yyyy', { locale: getDateLocale() })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 text-center">
                                <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 dark:text-gray-300">No matches found</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Matches will appear here</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Likes Given ({likes.length})</h4>
                          <div className="space-y-2">
                            {likes.length > 0 ? (
                              likes.slice(0, 5).map((like) => (
                                <div key={like.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                                      <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Super Like</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(like.created_at), 'dd MMM yyyy', { locale: getDateLocale() })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 text-center">
                                <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 dark:text-gray-300">No likes sent</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sent likes will appear here</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Messages Tab */}
                  <TabsContent value="messages" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Message History ({messages.length})</h3>
                      
                      <div className="space-y-4">
                        {messages.length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {messages.map((message) => (
                              <div key={message.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                                      Sent
                                    </Badge>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {format(new Date(message.created_at), 'dd MMM yyyy HH:mm', { locale: getDateLocale() })}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 mb-2">{message.content}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Conversation ID: {message.conversation_id}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 text-center">
                            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">No conversations yet</h4>
                            <p className="text-gray-600 dark:text-gray-300">Message history will appear here when user starts chatting</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Role & Subscription Tab */}
                  <TabsContent value="subscription" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Role & Subscription Management</h3>
                      
                      {/* Current Status */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Current Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Role</p>
                            {getRoleBadge(user.role || undefined)}
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                            <Badge className={user.is_banned ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300" : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"}>
                              {user.is_banned ? 'Banned' : 'Active'}
                            </Badge>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Expires</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {user.subscription_expires_at 
                                ? format(new Date(user.subscription_expires_at), 'dd MMM yyyy', { locale: getDateLocale() })
                                : 'Never'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Role Management */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-blue-600" />
                          Change User Role
                        </h4>
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <Button
                              onClick={() => handleRoleChange('registered')}
                              size="sm"
                              variant={user.role === 'registered' ? 'default' : 'outline'}
                              disabled={updatingRole === 'registered'}
                              className="w-full transition-all duration-200 hover:scale-105"
                            >
                              {updatingRole === 'registered' ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 mr-2" />
                                  Regular User
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleRoleChange('moderator')}
                              size="sm"
                              variant={user.role === 'moderator' ? 'default' : 'outline'}
                              disabled={updatingRole === 'moderator'}
                              className="w-full transition-all duration-200 hover:scale-105"
                            >
                              {updatingRole === 'moderator' ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3 h-3 mr-2" />
                                  Moderator
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleRoleChange('admin')}
                              size="sm"
                              variant={user.role === 'admin' ? 'default' : 'outline'}
                              disabled={updatingRole === 'admin'}
                              className="w-full transition-all duration-200 hover:scale-105"
                            >
                              {updatingRole === 'admin' ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-2" />
                                  Admin
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Changes to role permissions take effect immediately.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Subscription Management */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Grant Premium Subscription</h4>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Subscription Tier
                              </Label>
                              <Select value={subscriptionRole} onValueChange={setSubscriptionRole}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select tier" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="silver">Silver (Basic Premium)</SelectItem>
                                  <SelectItem value="gold">Gold (Premium Plus)</SelectItem>
                                  <SelectItem value="platinum">Platinum (Ultimate)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Duration
                              </Label>
                              <Select value={subscriptionDuration} onValueChange={setSubscriptionDuration}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="7">1 Week</SelectItem>
                                  <SelectItem value="30">1 Month</SelectItem>
                                  <SelectItem value="90">3 Months</SelectItem>
                                  <SelectItem value="180">6 Months</SelectItem>
                                  <SelectItem value="365">1 Year</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-end">
                              <Button 
                                onClick={handleQuickSubscriptionUpdate}
                                disabled={subscriptionLoading}
                                className="w-full"
                              >
                                {subscriptionLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  'Grant Subscription'
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="border-t pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick Grant Options:</p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() => handleSubscriptionUpdate('silver', 30)}
                                size="sm"
                                variant="outline"
                                disabled={subscriptionLoading}
                                className="bg-gray-50 dark:bg-gray-700"
                              >
                                Silver - 1 Month
                              </Button>
                              <Button
                                onClick={() => handleSubscriptionUpdate('gold', 30)}
                                size="sm"
                                variant="outline"
                                disabled={subscriptionLoading}
                                className="bg-gray-50 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600/50 text-gray-800 dark:text-gray-300"
                              >
                                Gold - 1 Month
                              </Button>
                              <Button
                                onClick={() => handleSubscriptionUpdate('platinum', 30)}
                                size="sm"
                                variant="outline"
                                disabled={subscriptionLoading}
                                className="bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300"
                              >
                                Platinum - 1 Month
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Moderation Tab */}
                  <TabsContent value="moderation" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">User Moderation</h3>
                      
                      {/* Ban/Unban Controls */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                          <Ban className="w-4 h-4 mr-2 text-red-600" />
                          Account Status
                        </h4>
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <Badge className={user.is_banned ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300" : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"}>
                                {user.is_banned ? 'Banned' : 'Active'}
                              </Badge>
                              {user.is_banned && user.ban_reason && (
                                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                                  Reason: {user.ban_reason}
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={handleBanToggle}
                              variant={user.is_banned ? "default" : "destructive"}
                              size="sm"
                              className={user.is_banned ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {user.is_banned ? (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Unban User
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 mr-2" />
                                  Ban User
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {!user.is_banned && (
                            <div className="border-t pt-4">
                              <p className="text-sm text-red-700 dark:text-red-300 mb-3">Quick Ban Options:</p>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  onClick={() => handleBanUser('Inappropriate content')}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  Inappropriate Content
                                </Button>
                                <Button
                                  onClick={() => handleBanUser('Spam or fake profile')}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  Spam/Fake Profile
                                </Button>
                                <Button
                                  onClick={() => handleBanUser('Harassment')}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  Harassment
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Media Moderation */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-purple-600" />
                          Media Moderation
                        </h4>
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                              <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Photos Status</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {user.photos?.length || 0} photo(s) uploaded
                              </p>
                              <Button
                                onClick={() => navigate('/admin/content-moderation')}
                                size="sm"
                                variant="outline"
                                className="w-full"
                              >
                                View in Content Moderation
                              </Button>
                            </div>
                            
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                              <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Quick Actions</h5>
                              <div className="space-y-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-red-600 border-red-300"
                                  onClick={() => handleDeleteAllPhotos()}
                                >
                                  Delete All Photos
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleResetProfile()}
                                >
                                  Reset Profile
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Moderation History */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Moderation History</h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No moderation actions recorded for this user.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Preferences Tab */}
                  <TabsContent value="preferences" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">User Preferences</h3>
                      
                      {/* Discovery Preferences */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Discovery Settings</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Show Me</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{user.show_me || 'Everyone'}</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Age Range</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {user.age_min || 18} - {user.age_max || 99} years
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Max Distance</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{user.max_distance || 100} km</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Profile Visibility</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{user.profile_visibility || 'Public'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Privacy Settings</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Show Distance</p>
                            <Badge className={user.show_distance ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"}>
                              {user.show_distance ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Show Age</p>
                            <Badge className={user.show_age ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"}>
                              {user.show_age ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Show Online Status</p>
                            <Badge className={user.show_online_status ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"}>
                              {user.show_online_status ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Show Last Seen</p>
                            <Badge className={user.show_last_seen ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"}>
                              {user.show_last_seen ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Security & System Information</h3>
                      
                      {/* Account Security */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Account Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                            <p className="font-mono text-sm text-gray-800 dark:text-gray-200">{user.id}</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{user.email || 'Not provided'}</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{user.phone || 'Not provided'}</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                            <Badge className={user.is_banned ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300" : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"}>
                              {user.is_banned ? 'Banned' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* IP Information */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Network Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current IP Address</p>
                            <p className="font-mono text-sm text-gray-800 dark:text-gray-200">{user.ip_address || 'Not tracked'}</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Last Known IP</p>
                            <p className="font-mono text-sm text-gray-800 dark:text-gray-200">{user.last_ip_address || 'Not tracked'}</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Online Status</p>
                            <Badge className={user.is_online ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"}>
                              {user.is_online ? 'Online' : 'Offline'}
                            </Badge>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Last Activity</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              {user.last_activity 
                                ? format(new Date(user.last_activity), 'dd MMM yyyy HH:mm', { locale: getDateLocale() })
                                : 'Not tracked'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Subscription Information */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Subscription Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
                            <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                              {user.subscription_tier || user.role || 'Free'}
                            </Badge>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Subscription Status</p>
                            <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                              {user.subscription_status || 'Active'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Important Dates</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Registration Date</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {format(new Date(user.created_at), 'dd MMMM yyyy HH:mm', { locale: getDateLocale() })}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Last Profile Update</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {format(new Date(user.updated_at), 'dd MMMM yyyy HH:mm', { locale: getDateLocale() })}
                            </p>
                          </div>
                          {user.last_seen && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Last Seen</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                {format(new Date(user.last_seen), 'dd MMMM yyyy HH:mm', { locale: getDateLocale() })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Photo Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background/95 backdrop-blur-md border-0">
          <DialogHeader className="absolute top-4 left-4 z-50">
            <DialogTitle className="text-white">
              Fotoğraf {currentPhotoIndex + 1} / {user?.photos?.length || 0}
            </DialogTitle>
          </DialogHeader>
          
          {/* Close button */}
          <Button
            onClick={closePhotoModal}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Photo navigation */}
          {user?.photos && user.photos.length > 1 && (
            <>
              <Button
                onClick={prevPhoto}
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                onClick={nextPhoto}
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Photo display */}
          <div className="flex items-center justify-center min-h-[70vh] p-4">
            {user?.photos?.[currentPhotoIndex] && (
              <img
                src={user.photos[currentPhotoIndex]}
                alt={`Photo ${currentPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Photo thumbnails */}
          {user?.photos && user.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="flex space-x-2 bg-background/80 rounded-lg p-2">
                {user.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentPhotoIndex
                        ? 'border-white shadow-lg'
                        : 'border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={showRoleChangeDialog} onOpenChange={setShowRoleChangeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-orange-600" />
              Confirm Role Change
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-600/50">
              <p className="text-sm text-gray-800 dark:text-gray-300">
                You are about to assign <span className="font-semibold">{pendingRole?.toUpperCase()}</span> role to this user.
                {pendingRole === 'admin' && ' This will grant full administrative privileges.'}
                {pendingRole === 'moderator' && ' This will grant moderation privileges.'}
              </p>
            </div>
            
            <div>
              <Label htmlFor="roleChangeReason" className="text-sm font-medium">
                Reason for role change (optional)
              </Label>
              <Input
                id="roleChangeReason"
                value={roleChangeReason}
                onChange={(e) => setRoleChangeReason(e.target.value)}
                placeholder="Enter reason for this role change..."
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setShowRoleChangeDialog(false);
                  setPendingRole(null);
                  setRoleChangeReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRoleChange}
                disabled={updatingRole === pendingRole}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {updatingRole === pendingRole ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  `Assign ${pendingRole?.toUpperCase()}`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban User Confirmation Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Ban className="w-5 h-5 mr-2 text-red-600" />
              Confirm User Ban
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-300">
                You are about to ban this user. This action will prevent them from accessing the platform.
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Reason for ban
              </Label>
              <div className="space-y-2">
                {['Inappropriate content', 'Spam or fake profile', 'Harassment', 'Violating terms of service', 'custom'].map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="banReason"
                      value={reason}
                      checked={banReason === reason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {reason === 'custom' ? 'Custom reason' : reason}
                    </span>
                  </label>
                ))}
              </div>
              
              {banReason === 'custom' && (
                <Input
                  value={customBanReason}
                  onChange={(e) => setCustomBanReason(e.target.value)}
                  placeholder="Enter custom ban reason..."
                  className="mt-2"
                />
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setShowBanDialog(false);
                  setBanReason('');
                  setCustomBanReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBanUser}
                disabled={!banReason || (banReason === 'custom' && !customBanReason)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetail;
