import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Users, 
  Flag, 
  MessageSquare, 
  AlertTriangle,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/types/roles";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  reporter?: {
    name: string;
    email: string;
  };
  reported_user?: {
    name: string;
    email: string;
    photos: string[];
  };
}

const ModeratorPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    pendingReports: 0,
    resolvedToday: 0,
    bannedUsers: 0,
    activeChats: 0
  });

  useEffect(() => {
    checkModeratorAccess();
    if (userRole === 'moderator' || userRole === 'admin') {
      loadStats();
      loadReports();
    }
  }, [user, userRole]);

  const checkModeratorAccess = async () => {
    if (!user) {
      navigate("/");
      return;
    }

    try {
      // Geliştirme ortamında tüm erişimlere izin ver
      if (import.meta.env.MODE === 'development') {
        setUserRole('moderator');
        setLoading(false);
        return;
      }

      // TODO: Gerçek üretimde profiles tablosundan role kontrol edilecek
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('role')
      //   .eq('id', user.id)
      //   .single();

      // if (error || !data?.role || !['moderator', 'admin'].includes(data.role)) {
      //   toast({
      //     title: "Yetkisiz Erişim",
      //     description: "Bu sayfaya erişim yetkiniz yok.",
      //     variant: "destructive"
      //   });
      //   navigate("/");
      //   return;
      // }

      // setUserRole(data.role as UserRole);
      
      // Geçici olarak moderator rolü ata
      setUserRole('moderator');
    } catch (error) {
      console.error('Moderator check error:', error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // Simüle edilmiş istatistikler
    setStats({
      pendingReports: 12,
      resolvedToday: 8,
      bannedUsers: 3,
      activeChats: 156
    });
  };

  const loadReports = async () => {
    // Simüle edilmiş raporlar
    const mockReports: Report[] = [
      {
        id: '1',
        reporter_id: 'user1',
        reported_user_id: 'user2',
        reason: 'inappropriate_content',
        description: 'Uygunsuz profil fotoğrafı',
        status: 'pending',
        created_at: new Date().toISOString(),
        reporter: { name: 'John Doe', email: 'john@example.com' },
        reported_user: { 
          name: 'Jane Smith', 
          email: 'jane@example.com',
          photos: ['https://picsum.photos/100/100?random=1']
        }
      },
      {
        id: '2',
        reporter_id: 'user3',
        reported_user_id: 'user4',
        reason: 'harassment',
        description: 'Rahatsız edici mesajlar gönderiyor',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        reporter: { name: 'Alice Brown', email: 'alice@example.com' },
        reported_user: { 
          name: 'Bob Wilson', 
          email: 'bob@example.com',
          photos: ['https://picsum.photos/100/100?random=2']
        }
      }
    ];
    setReports(mockReports);
  };

  const handleResolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      // TODO: Gerçek implementasyon
      toast({
        title: "Başarılı",
        description: action === 'resolved' ? "Rapor çözümlendi" : "Rapor reddedildi",
      });
      loadReports();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">Moderatör Paneli</h1>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">
                MOD
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {user?.email}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Bekleyen Raporlar</CardTitle>
              <Flag className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pendingReports}</div>
              <p className="text-xs text-gray-400 mt-1">Çözüm bekliyor</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Bugün Çözümlenen</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.resolvedToday}</div>
              <p className="text-xs text-gray-400 mt-1">Rapor</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Yasaklı Kullanıcı</CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.bannedUsers}</div>
              <p className="text-xs text-gray-400 mt-1">Bu hafta</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Aktif Sohbet</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeChats}</div>
              <p className="text-xs text-gray-400 mt-1">Şu anda</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-800/50 border-gray-700 grid w-full grid-cols-3">
            <TabsTrigger value="reports" className="data-[state=active]:bg-gray-700">
              <Flag className="w-4 h-4 mr-2" />
              Raporlar
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-gray-700">
              <Clock className="w-4 h-4 mr-2" />
              Aktivite Logları
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Kullanıcı Raporları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={report.reported_user?.photos[0]} 
                            alt="Reported user"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-medium text-white">
                              {report.reported_user?.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              Raporlayan: {report.reporter?.name}
                            </p>
                            <Badge className="mt-1 bg-amber-500/20 text-amber-400 border-amber-500">
                              {report.reason === 'inappropriate_content' ? 'Uygunsuz İçerik' : 
                               report.reason === 'harassment' ? 'Taciz' : report.reason}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            {new Date(report.created_at).toLocaleDateString('tr-TR')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(report.created_at).toLocaleTimeString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm bg-gray-800/50 rounded p-3">
                        {report.description}
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleResolveReport(report.id, 'resolved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Çözümlendi
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveReport(report.id, 'dismissed')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reddet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Profili İncele
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Kullanıcı Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="bg-blue-900/20 border-blue-700">
                  <AlertTriangle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    Kullanıcı yönetimi için ana admin panelini kullanın.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Aktivite Logları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Aktivite logları yakında eklenecek...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModeratorPanel;
