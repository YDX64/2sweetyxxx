import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Save, 
  Eye,
  AlertTriangle,
  Info,
  Shield,
  ScrollText,
  Globe,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface Stat {
  value: string;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconType = any;

interface PageContent {
  id: string;
  title: string;
  icon?: IconType;
  content: {
    hero?: {
      title: string;
      subtitle: string;
      badge?: string;
    };
    mission?: {
      title: string;
      description: string;
    };
    stats?: Stat[];
    sections?: Record<string, unknown>[];
    lastUpdated?: string;
  };
}

const ContentManagement = () => {
  const { t } = useLanguage();
  const [selectedPage, setSelectedPage] = useState<string>('about');
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock data - gerçek uygulamada Supabase'den gelecek
  const pages = {
    about: {
      id: 'about',
      title: t('adminContent.pages.about.title'),
      icon: Info,
      content: {
        hero: {
          title: t('adminContent.pages.about.title'),
          subtitle: t('adminContent.pages.about.description'),
          badge: t('adminContent.pages.about.title')
        },
        mission: {
          title: t('adminContent.pages.about.mission'),
          description: t('adminContent.pages.about.missionText')
        },
        stats: [
          { value: '50M+', label: t('adminContent.pages.about.stats.totalMatches') },
          { value: '10M+', label: t('adminContent.pages.about.stats.activeUsers') },
          { value: '2M+', label: t('adminContent.pages.about.stats.happyCouples') },
          { value: '99%', label: t('adminContent.pages.about.stats.satisfactionRate') }
        ]
      }
    },
    privacy: {
      id: 'privacy',
      title: t('privacyPolicy'),
      icon: Shield,
      content: {
        hero: {
          title: t('privacyPolicy'),
          subtitle: t('adminContent.pages.privacy.description'),
          badge: t('adminContent.pages.privacy.title')
        },
        lastUpdated: t('adminContent.pages.privacy.lastUpdated')
      }
    },
    terms: {
      id: 'terms',
      title: t('termsOfService'),
      icon: ScrollText,
      content: {
        hero: {
          title: t('termsOfService'),
          subtitle: t('adminContent.pages.terms.description'),
          badge: t('adminContent.pages.terms.title')
        },
        lastUpdated: t('adminContent.pages.terms.lastUpdated')
      }
    },
    gdpr: {
      id: 'gdpr',
      title: t('gdprCompliance'),
      icon: Globe,
      content: {
        hero: {
          title: t('gdprCompliance'),
          subtitle: t('adminContent.pages.gdpr.description'),
          badge: t('adminContent.pages.gdpr.title')
        },
        lastUpdated: t('adminContent.pages.gdpr.effectiveDate')
      }
    }
  };

  useEffect(() => {
    loadPageContent(selectedPage);
  }, [selectedPage]);

  const loadPageContent = (pageId: string) => {
    setLoading(true);
    // Simüle edilmiş veri yükleme
    setTimeout(() => {
      setContent(pages[pageId as keyof typeof pages]);
      setLoading(false);
    }, 500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Supabase'e kaydet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('success'),
        description: t('adminContent.updateSuccess'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('adminContent.updateError'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Yeni sekmede sayfayı aç
    const pageUrls: Record<string, string> = {
      about: '/about',
      privacy: '/privacy-policy',
      terms: '/terms-of-service',
      gdpr: '/gdpr'
    };
    
    window.open(pageUrls[selectedPage], '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">{t('adminContent.title')}</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('adminContent.preview')}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? t('adminContent.saving') : t('adminContent.save')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPage} onValueChange={setSelectedPage}>
            <TabsList className="bg-gray-700 border-gray-600 grid w-full grid-cols-4">
              {Object.entries(pages).map(([key, page]) => {
                const Icon = page.icon;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="data-[state=active]:bg-gray-600 text-gray-300 data-[state=active]:text-white"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {page.title}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">{t('loading')}</div>
              </div>
            ) : content && (
              <TabsContent value={selectedPage} className="mt-6 space-y-6">
                {/* Hero Section Editor */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">{t('adminContent.heroSection')}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero-title" className="text-gray-300">{t('title')}</Label>
                      <Input
                        id="hero-title"
                        value={content.content.hero?.title || ''}
                        onChange={(e) => {
                          setContent({
                            ...content,
                            content: {
                              ...content.content,
                              hero: {
                                ...content.content.hero!,
                                title: e.target.value
                              }
                            }
                          });
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hero-badge" className="text-gray-300">{t('adminContent.badgeText')}</Label>
                      <Input
                        id="hero-badge"
                        value={content.content.hero?.badge || ''}
                        onChange={(e) => {
                          setContent({
                            ...content,
                            content: {
                              ...content.content,
                              hero: {
                                ...content.content.hero!,
                                badge: e.target.value
                              }
                            }
                          });
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="hero-subtitle" className="text-gray-300">{t('adminContent.subtitle')}</Label>
                    <Textarea
                      id="hero-subtitle"
                      value={content.content.hero?.subtitle || ''}
                      onChange={(e) => {
                        setContent({
                          ...content,
                          content: {
                            ...content.content,
                            hero: {
                              ...content.content.hero!,
                              subtitle: e.target.value
                            }
                          }
                        });
                      }}
                      rows={3}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {/* Page Specific Content */}
                {selectedPage === 'about' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('adminContent.mission')}</h3>
                    <div>
                      <Label htmlFor="mission-title" className="text-gray-300">{t('adminContent.missionTitle')}</Label>
                      <Input
                        id="mission-title"
                        defaultValue={t('adminContent.pages.about.mission')}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mission-desc" className="text-gray-300">{t('adminContent.missionDescription')}</Label>
                      <Textarea
                        id="mission-desc"
                        defaultValue={t('adminContent.pages.about.missionText')}
                        rows={4}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mt-6">{t('adminContent.statistics')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {content.content.stats?.map((stat, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={stat.value}
                            placeholder={t('adminContent.value')}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <Input
                            value={stat.label}
                            placeholder={t('adminContent.label')}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Updated Info */}
                {content.content.lastUpdated && (
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{t('adminContent.lastUpdated')}: {content.content.lastUpdated}</span>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">{t('adminContent.seoSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta-title" className="text-gray-300">{t('adminContent.metaTitle')}</Label>
            <Input
              id="meta-title"
              placeholder={t('adminContent.metaTitlePlaceholder')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="meta-desc" className="text-gray-300">{t('adminContent.metaDescription')}</Label>
            <Textarea
              id="meta-desc"
              placeholder={t('adminContent.metaDescriptionPlaceholder')}
              rows={3}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="meta-keywords" className="text-gray-300">{t('adminContent.metaKeywords')}</Label>
            <Input
              id="meta-keywords"
              placeholder={t('adminContent.seo.keywordsPlaceholder')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagement;
