import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Shield, AlertTriangle, Clock, CheckCircle, FileText, User, Heart } from "lucide-react";

const TermsOfService = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Scale className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" />
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">Legal</Badge>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {t("legalPages.terms.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t("legalPages.terms.subtitle")}
          </p>
          <div className="mt-6 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            {t("legalPages.terms.lastUpdated")}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Overview */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>{t("legalPages.terms.quickOverview.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.quickOverview.description")}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <User className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">{t("legalPages.terms.quickOverview.ageOnly")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("legalPages.terms.quickOverview.ageVerification")}</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">{t("legalPages.terms.quickOverview.safeEnvironment")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("legalPages.terms.quickOverview.verifiedProfiles")}</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Heart className="w-8 h-8 text-pink-500 dark:text-pink-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">{t("legalPages.terms.quickOverview.respectfulCommunity")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("legalPages.terms.quickOverview.zeroTolerance")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 1: Acceptance of Terms */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section1.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section1.paragraph1")}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section1.paragraph2")}
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Eligibility */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section2.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section2.intro")}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>{t("legalPages.terms.section2.items.0")}</li>
                <li>{t("legalPages.terms.section2.items.1")}</li>
                <li>{t("legalPages.terms.section2.items.2")}</li>
                <li>{t("legalPages.terms.section2.items.3")}</li>
                <li>{t("legalPages.terms.section2.items.4")}</li>
              </ul>
              <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-300">{t("legalPages.terms.section2.ageVerificationTitle")}</p>
                    <p className="text-gray-700 dark:text-gray-400 text-sm">{t("legalPages.terms.section2.ageVerificationDesc")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Account Rules */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section3.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section3.intro")}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 dark:text-green-400">{t("legalPages.terms.section3.allowedTitle")}</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.terms.section3.allowedItems.0")}</li>
                    <li>{t("legalPages.terms.section3.allowedItems.1")}</li>
                    <li>{t("legalPages.terms.section3.allowedItems.2")}</li>
                    <li>{t("legalPages.terms.section3.allowedItems.3")}</li>
                    <li>{t("legalPages.terms.section3.allowedItems.4")}</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700 dark:text-red-400">{t("legalPages.terms.section3.prohibitedTitle")}</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.terms.section3.prohibitedItems.0")}</li>
                    <li>{t("legalPages.terms.section3.prohibitedItems.1")}</li>
                    <li>{t("legalPages.terms.section3.prohibitedItems.2")}</li>
                    <li>{t("legalPages.terms.section3.prohibitedItems.3")}</li>
                    <li>{t("legalPages.terms.section3.prohibitedItems.4")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Privacy and Data */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section4.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section4.intro")}
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
                  <div>
                    <p className="font-semibold dark:text-gray-200">{t("legalPages.terms.section4.dataSecurityTitle")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.terms.section4.dataSecurityDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-green-500 dark:text-green-400 mt-1" />
                  <div>
                    <p className="font-semibold dark:text-gray-200">{t("legalPages.terms.section4.yourRightsTitle")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.terms.section4.yourRightsDesc")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Premium Services */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section5.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section5.intro")}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>{t("legalPages.terms.section5.items.0")}</li>
                <li>{t("legalPages.terms.section5.items.1")}</li>
                <li>{t("legalPages.terms.section5.items.2")}</li>
                <li>{t("legalPages.terms.section5.items.3")}</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-300 font-semibold">{t("legalPages.terms.section5.cancellationTitle")}</p>
                <p className="text-blue-700 dark:text-blue-400 text-sm">{t("legalPages.terms.section5.cancellationDesc")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Termination */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section6.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section6.intro")}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 dark:text-gray-200">{t("legalPages.terms.section6.byYouTitle")}</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.terms.section6.byYouItems.0")}</li>
                    <li>{t("legalPages.terms.section6.byYouItems.1")}</li>
                    <li>{t("legalPages.terms.section6.byYouItems.2")}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 dark:text-gray-200">{t("legalPages.terms.section6.byUsTitle")}</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.terms.section6.byUsItems.0")}</li>
                    <li>{t("legalPages.terms.section6.byUsItems.1")}</li>
                    <li>{t("legalPages.terms.section6.byUsItems.2")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Liability */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section7.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section7.intro")}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>{t("legalPages.terms.section7.items.0")}</li>
                <li>{t("legalPages.terms.section7.items.1")}</li>
                <li>{t("legalPages.terms.section7.items.2")}</li>
                <li>{t("legalPages.terms.section7.items.3")}</li>
              </ul>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300">{t("legalPages.terms.section7.safetyTitle")}</p>
                    <p className="text-red-700 dark:text-red-400 text-sm">{t("legalPages.terms.section7.safetyDesc")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Governing Law */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section8.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section8.intro")}
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Scale className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
                  <div>
                    <p className="font-semibold dark:text-gray-200">{t("legalPages.terms.section8.disputeTitle")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.terms.section8.disputeDesc")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 9: Changes to Terms */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.terms.section9.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section9.paragraph1")}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.terms.section9.paragraph2")}
              </p>
            </CardContent>
          </Card>

          {/* Section 10: Contact */}
          <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-800 text-white shadow-xl border-0">
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-white drop-shadow-lg" />
              <h3 className="text-2xl font-bold mb-4 text-white">{t("legalPages.terms.contact.title")}</h3>
              <p className="mb-6 text-blue-100 dark:text-gray-300">
                {t("legalPages.terms.contact.description")}
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">{t("legalPages.terms.contact.legalInquiries")}</h4>
                  <p className="text-sm text-blue-100 dark:text-gray-300">{t("legalPages.terms.contact.legalEmail")}</p>
                </div>
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">{t("legalPages.terms.contact.generalSupport")}</h4>
                  <p className="text-sm text-blue-100 dark:text-gray-300">{t("legalPages.terms.contact.supportEmail")}</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-blue-200 dark:text-gray-300">
                <p>{t("legalPages.terms.contact.availability")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
