import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Users, Database, Globe, Clock, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto" />
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">Privacy</Badge>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {t("legalPages.privacy.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t("legalPages.privacy.subtitle")}
          </p>
          <div className="mt-6 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            {t("legalPages.privacy.lastUpdated")}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Privacy Overview */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span>{t("legalPages.privacy.overview.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.privacy.overview.description")}
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Lock className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">{t("legalPages.privacy.overview.sslTitle")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("legalPages.privacy.overview.sslDesc")}</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Database className="w-8 h-8 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">{t("legalPages.privacy.overview.storageTitle")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("legalPages.privacy.overview.storageDesc")}</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Eye className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">{t("legalPages.privacy.overview.controlTitle")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("legalPages.privacy.overview.controlDesc")}</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Globe className="w-8 h-8 text-orange-500 dark:text-orange-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">{t("legalPages.privacy.overview.gdprTitle")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("legalPages.privacy.overview.gdprDesc")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.privacy.section1.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.privacy.section1.intro")}
              </p>

              <div className="space-y-4">
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">{t("legalPages.privacy.section1.mandatoryTitle")}</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.privacy.section1.mandatoryItems.0")}</li>
                    <li>{t("legalPages.privacy.section1.mandatoryItems.1")}</li>
                    <li>{t("legalPages.privacy.section1.mandatoryItems.2")}</li>
                    <li>{t("legalPages.privacy.section1.mandatoryItems.3")}</li>
                    <li>{t("legalPages.privacy.section1.mandatoryItems.4")}</li>
                  </ul>
                </div>

                <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">{t("legalPages.privacy.section1.optionalTitle")}</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.privacy.section1.optionalItems.0")}</li>
                    <li>{t("legalPages.privacy.section1.optionalItems.1")}</li>
                    <li>{t("legalPages.privacy.section1.optionalItems.2")}</li>
                    <li>{t("legalPages.privacy.section1.optionalItems.3")}</li>
                  </ul>
                </div>

                <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-900/10">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">{t("legalPages.privacy.section1.automaticTitle")}</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.privacy.section1.automaticItems.0")}</li>
                    <li>{t("legalPages.privacy.section1.automaticItems.1")}</li>
                    <li>{t("legalPages.privacy.section1.automaticItems.2")}</li>
                    <li>{t("legalPages.privacy.section1.automaticItems.3")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.privacy.section2.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.privacy.section2.intro")}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-pink-500 dark:text-pink-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">{t("legalPages.privacy.section2.serviceTitle")}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.privacy.section2.serviceDesc")}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">{t("legalPages.privacy.section2.securityTitle")}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.privacy.section2.securityDesc")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Database className="w-5 h-5 text-green-500 dark:text-green-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">{t("legalPages.privacy.section2.improvementTitle")}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.privacy.section2.improvementDesc")}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-purple-500 dark:text-purple-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">{t("legalPages.privacy.section2.communicationTitle")}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.privacy.section2.communicationDesc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.privacy.section3.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.privacy.section3.intro")}
              </p>

              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>{t("legalPages.privacy.section3.items.0")}</li>
                <li>{t("legalPages.privacy.section3.items.1")}</li>
                <li>{t("legalPages.privacy.section3.items.2")}</li>
                <li>{t("legalPages.privacy.section3.items.3")}</li>
              </ul>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300 font-semibold">{t("legalPages.privacy.section3.neverShareTitle")}</p>
                <p className="text-red-700 dark:text-red-400 text-sm">{t("legalPages.privacy.section3.neverShareDesc")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.privacy.section4.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.privacy.section4.intro")}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 dark:text-gray-200">{t("legalPages.privacy.section4.technicalTitle")}</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.privacy.section4.technicalItems.0")}</li>
                    <li>{t("legalPages.privacy.section4.technicalItems.1")}</li>
                    <li>{t("legalPages.privacy.section4.technicalItems.2")}</li>
                    <li>{t("legalPages.privacy.section4.technicalItems.3")}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 dark:text-gray-200">{t("legalPages.privacy.section4.operationalTitle")}</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>{t("legalPages.privacy.section4.operationalItems.0")}</li>
                    <li>{t("legalPages.privacy.section4.operationalItems.1")}</li>
                    <li>{t("legalPages.privacy.section4.operationalItems.2")}</li>
                    <li>{t("legalPages.privacy.section4.operationalItems.3")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.privacy.section5.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.privacy.section5.intro")}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-sm dark:text-gray-200">{t("legalPages.privacy.section5.accessTitle")}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{t("legalPages.privacy.section5.accessDesc")}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-sm dark:text-gray-200">{t("legalPages.privacy.section5.correctionTitle")}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{t("legalPages.privacy.section5.correctionDesc")}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-semibold text-sm dark:text-gray-200">{t("legalPages.privacy.section5.deletionTitle")}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{t("legalPages.privacy.section5.deletionDesc")}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-semibold text-sm dark:text-gray-200">{t("legalPages.privacy.section5.portabilityTitle")}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{t("legalPages.privacy.section5.portabilityDesc")}</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-300 font-semibold">{t("legalPages.privacy.section5.exerciseTitle")}</p>
                <p className="text-blue-700 dark:text-blue-400 text-sm">{t("legalPages.privacy.section5.exerciseDesc")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.privacy.section6.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.privacy.section6.intro")}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">{t("legalPages.privacy.section6.tableHeaders.dataType")}</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">{t("legalPages.privacy.section6.tableHeaders.retention")}</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">{t("legalPages.privacy.section6.tableHeaders.reason")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.profile.type")}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.profile.period")}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.profile.reason")}</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.messages.type")}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.messages.period")}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.messages.reason")}</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.analytics.type")}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.analytics.period")}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.analytics.reason")}</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.support.type")}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.support.period")}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t("legalPages.privacy.section6.tableRows.support.reason")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>{t("legalPages.privacy.section7.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t("legalPages.privacy.section7.intro")}
              </p>

              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold dark:text-gray-200">{t("legalPages.privacy.section7.essentialTitle")}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.privacy.section7.essentialDesc")}</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-semibold dark:text-gray-200">{t("legalPages.privacy.section7.analyticsTitle")}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.privacy.section7.analyticsDesc")}</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-semibold dark:text-gray-200">{t("legalPages.privacy.section7.preferenceTitle")}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("legalPages.privacy.section7.preferenceDesc")}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("legalPages.privacy.section7.manageDesc")}
              </p>
            </CardContent>
          </Card>

          {/* Contact and DPO */}
          <Card className="bg-gradient-to-br from-green-600 via-green-700 to-blue-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-800 text-white shadow-xl border-0">
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-white drop-shadow-lg" />
              <h3 className="text-2xl font-bold mb-4 text-white">{t("legalPages.privacy.contact.title")}</h3>
              <p className="mb-6 text-green-100 dark:text-gray-300">
                {t("legalPages.privacy.contact.description")}
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">{t("legalPages.privacy.contact.dpoTitle")}</h4>
                  <p className="text-sm text-green-100 dark:text-gray-300 mb-2">{t("legalPages.privacy.contact.dpoEmail")}</p>
                  <p className="text-sm text-green-100 dark:text-gray-300">{t("legalPages.privacy.contact.dpoRole")}</p>
                </div>
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">{t("legalPages.privacy.contact.privacyTitle")}</h4>
                  <p className="text-sm text-green-100 dark:text-gray-300 mb-1">{t("legalPages.privacy.contact.privacyEmail")}</p>
                  <p className="text-sm text-green-100 dark:text-gray-300">{t("legalPages.privacy.contact.privacyRole")}</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-green-200 dark:text-gray-300">
                <p>{t("legalPages.privacy.contact.availability")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
