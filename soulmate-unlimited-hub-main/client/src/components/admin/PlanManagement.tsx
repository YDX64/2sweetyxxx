import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Crown, 
  Heart, 
  Star, 
  Save, 
  Edit,
  Plus,
  Trash2,
  DollarSign,
  Check
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserRole, ROLE_INFO } from "@/types/roles";
import { useTranslation } from "react-i18next";

interface PlanFeature {
  id: string;
  text: string;
}

interface PlanData {
  role: UserRole;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  badge: string;
  color: string;
  bgGradient: string;
}

const PlanManagement = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<UserRole>('silver');
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Context7 MCP pattern: Move reactive logic inside useEffect to avoid dependency issues
  useEffect(() => {
    // ROLE_INFO'dan planları yükle ve çevirileri uygula
    const planData: PlanData[] = ['silver', 'gold', 'platinum'].map(role => ({
      role: role as UserRole,
      displayName: t(`role.${role}.displayName`),
      description: t(`role.${role}.description`),
      monthlyPrice: ROLE_INFO[role as UserRole].monthlyPrice,
      yearlyPrice: ROLE_INFO[role as UserRole].yearlyPrice,
      features: ROLE_INFO[role as UserRole].features.map((f, i) => ({
        id: `${role}-feature-${i}`,
        text: t(f) // Özellik çevirisi
      })),
      badge: ROLE_INFO[role as UserRole].badge || '',
      color: ROLE_INFO[role as UserRole].color,
      bgGradient: ROLE_INFO[role as UserRole].bgGradient
    }));
    setPlans(planData);
  }, [t]); // ✅ All dependencies declared - t is from useTranslation and is reactive

  const loadPlans = () => {
    // Context7 MCP pattern: Refactored to avoid dependency array issues
    // Plan data loading logic moved to useEffect
    console.log('loadPlans called - logic moved to useEffect');
  };

  const handleEditPlan = (plan: PlanData) => {
    setEditingPlan({ ...plan });
    setShowEditDialog(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    setSaving(true);
    try {
      // TODO: Supabase'e kaydet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Geçici olarak state'i güncelle
      setPlans(plans.map(p => 
        p.role === editingPlan.role ? editingPlan : p
      ));

      toast({
        title: t('successToast'),
        description: t('roleUpdatedMessage', { role: editingPlan.displayName }),
      });
      
      setShowEditDialog(false);
      setEditingPlan(null);
    } catch (error) {
      toast({
        title: t('errorToast'),
        description: t('roleUpdateError'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeature = () => {
    if (!editingPlan) return;
    
    const newFeature: PlanFeature = {
      id: `feature-${Date.now()}`,
      text: ''
    };
    
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, newFeature]
    });
  };

  const handleRemoveFeature = (featureId: string) => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter(f => f.id !== featureId)
    });
  };

  const handleFeatureChange = (featureId: string, text: string) => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.map(f => 
        f.id === featureId ? { ...f, text } : f
      )
    });
  };

  const getPlanIcon = (role: UserRole) => {
    switch (role) {
      case 'silver':
        return <Heart className="w-8 h-8" />;
      case 'gold':
        return <Star className="w-8 h-8" />;
      case 'platinum':
        return <Crown className="w-8 h-8" />;
      default:
        return <Heart className="w-8 h-8" />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{t('planManagement')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as UserRole)}>
              <TabsList className="bg-gray-700 border-gray-600 grid w-full grid-cols-3">
                {plans.map(plan => (
                  <TabsTrigger 
                    key={plan.role}
                    value={plan.role}
                    className="data-[state=active]:bg-gray-600 text-gray-300 data-[state=active]:text-white"
                  >
                    <Badge className={`mr-2 bg-gradient-to-r ${plan.bgGradient} text-white border-0`}>
                      {plan.badge}
                    </Badge>
                    {plan.displayName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {plans.map(plan => (
                <TabsContent key={plan.role} value={plan.role} className="mt-6">
                  <div className="bg-gray-700/50 rounded-lg p-6">
                    {/* Plan Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${plan.bgGradient} flex items-center justify-center`}>
                          <div className="text-white">
                            {getPlanIcon(plan.role)}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            {plan.displayName}
                            <Badge className={`bg-gradient-to-r ${plan.bgGradient} text-white border-0`}>
                              {plan.badge}
                            </Badge>
                          </h3>
                          <p className="text-gray-400 mt-1">{plan.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleEditPlan(plan)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t('editButton')}
                      </Button>
                    </div>

                    {/* Pricing */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">{t('monthlyPrice')}</span>
                          <DollarSign className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">${(plan.monthlyPrice / 100).toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">{t('yearlyPrice')}</span>
                          <DollarSign className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">${(plan.yearlyPrice / 100).toFixed(2)}</p>
                        <p className="text-sm text-green-400">{t('monthlyPrice')} ${(Math.round(plan.yearlyPrice / 12) / 100).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">{t('features')}</h4>
                      <ul className="space-y-2">
                        {plan.features.map(feature => (
                          <li key={feature.id} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-gray-300">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Fiyat Karşılaştırması */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{t('priceComparison')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300">{t('plan')}</th>
                    <th className="text-center py-3 px-4 text-gray-300">{t('monthly')}</th>
                    <th className="text-center py-3 px-4 text-gray-300">{t('yearly')}</th>
                    <th className="text-center py-3 px-4 text-gray-300">{t('discount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => {
                    const yearlyMonthly = Math.round(plan.yearlyPrice / 12);
                    const discount = Math.round((1 - yearlyMonthly / plan.monthlyPrice) * 100);
                    
                    return (
                      <tr key={plan.role} className="border-b border-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge className={`bg-gradient-to-r ${plan.bgGradient} text-white border-0`}>
                              {plan.badge}
                            </Badge>
                            <span className="text-white">{plan.displayName}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          ${(plan.monthlyPrice / 100).toFixed(2)}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-300">
                          ${(plan.yearlyPrice / 100).toFixed(2)}
                          <span className="block text-xs text-gray-500">
                            (${(yearlyMonthly / 100).toFixed(2)}/{t('monthText')})
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500">
                            %{discount} {t('discount')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editPlan')}: {editingPlan?.displayName}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('planDetails')}
            </DialogDescription>
          </DialogHeader>
          
          {editingPlan && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName" className="text-gray-300">{t('planName')}</Label>
                  <Input
                    id="displayName"
                    value={editingPlan.displayName}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      displayName: e.target.value
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="badge" className="text-gray-300">{t('badgeText')}</Label>
                  <Input
                    id="badge"
                    value={editingPlan.badge}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      badge: e.target.value
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">{t('description')}</Label>
                <Textarea
                  id="description"
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    description: e.target.value
                  })}
                  rows={2}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Pricing */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyPrice" className="text-gray-300">{t('monthlyPrice')} ($)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    value={editingPlan.monthlyPrice}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      monthlyPrice: parseInt(e.target.value) || 0
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="yearlyPrice" className="text-gray-300">{t('yearlyPrice')} ($)</Label>
                  <Input
                    id="yearlyPrice"
                    type="number"
                    value={editingPlan.yearlyPrice}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      yearlyPrice: parseInt(e.target.value) || 0
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-gray-300">{t('features')}</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddFeature}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addFeature')}
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingPlan.features.map((feature, index) => (
                    <div key={feature.id} className="flex items-center gap-2">
                      <Input
                        value={feature.text}
                        onChange={(e) => handleFeatureChange(feature.id, e.target.value)}
                        placeholder={`${t('feature')} ${index + 1}`}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveFeature(feature.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditingPlan(null);
              }}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlanManagement;
