import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, Users, Lock, FileText, Globe, Eye, Clock, Scale, AlertTriangle, Database, Mail } from "lucide-react";

const GDPRCompliance = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" />
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">EU</Badge>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {t("gdprCompliance")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            2Sweety is fully compliant with the European Union General Data Protection Regulation (GDPR), 
            ensuring maximum protection for our users' rights and personal data.
          </p>
          <div className="mt-6 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            GDPR Effective Date: May 25, 2018
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* GDPR Overview */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>What is GDPR?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The <strong className="dark:text-gray-200">General Data Protection Regulation (GDPR)</strong> is a comprehensive 
                data protection law created to protect the personal data of individuals living in the European Union.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Users className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">500M+ People</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Protected EU Citizens</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Scale className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">Legal Framework</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">27 EU Countries</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">Strong Protection</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Data Rights</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Basis for Processing */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>1. Legal Basis for Data Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Under GDPR Article 6, we process your personal data based on the following legal grounds:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 dark:text-green-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">Contract Performance</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Processing necessary to provide dating services</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">Consent</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">For marketing communications and optional features</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-purple-500 dark:text-purple-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">Legal Obligation</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Compliance with applicable laws and regulations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-orange-500 dark:text-orange-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">Legitimate Interest</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Security, fraud prevention, and service improvement</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your GDPR Rights */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>2. Your GDPR Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Under GDPR, you have the following rights regarding your personal data:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <span className="font-semibold dark:text-gray-200">Right to Access</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Request information about how your data is processed</p>
                  </div>
                  
                  <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-5 h-5 text-green-500 dark:text-green-400" />
                      <span className="font-semibold dark:text-gray-200">Right to Rectification</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Correct inaccurate or incomplete personal data</p>
                  </div>
                  
                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                      <span className="font-semibold dark:text-gray-200">Right to Erasure</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Request deletion of your personal data ("right to be forgotten")</p>
                  </div>
                  
                  <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-900/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                      <span className="font-semibold dark:text-gray-200">Right to Restrict Processing</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Limit how we process your personal data</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="border border-gray-200 dark:border-gray-600/50 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/80">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-semibold dark:text-gray-200">Right to Data Portability</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive your data in a machine-readable format</p>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-600/50 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/80">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold dark:text-gray-200">Right to Object</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Object to processing based on legitimate interests</p>
                  </div>
                  
                  <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50/50 dark:bg-indigo-900/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      <span className="font-semibold dark:text-gray-200">Rights Related to Automated Decision Making</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Request human intervention in automated processing</p>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-700/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Check className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-semibold dark:text-gray-200">Right to Withdraw Consent</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Withdraw consent at any time where processing is based on consent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Processing Activities */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>3. Record of Processing Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                In accordance with GDPR Article 30, we maintain a record of our data processing activities:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">Processing Purpose</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">Legal Basis</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">Data Categories</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Account Management</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Contract</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Profile data, Photos</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Until account deletion</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Matching Services</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Contract</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Preferences, Location</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Until account deletion</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Security & Safety</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Legitimate Interest</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Usage logs, IP addresses</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">2 years</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Marketing</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Consent</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Email, Preferences</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Until consent withdrawn</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>4. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                When transferring personal data outside the EU/EEA, we ensure adequate protection through:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                  <Shield className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1 dark:text-gray-200">Standard Contractual Clauses</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">EU Commission approved SCCs</p>
                </div>
                <div className="text-center p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                  <Check className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1 dark:text-gray-200">Adequacy Decisions</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Countries with adequate protection</p>
                </div>
                <div className="text-center p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
                  <FileText className="w-8 h-8 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1 dark:text-gray-200">Binding Corporate Rules</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Internal data protection policies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection Officer */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>5. Data Protection Officer (DPO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We have appointed a Data Protection Officer to oversee our GDPR compliance:
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Mail className="w-8 h-8 text-blue-500 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Contact Our DPO</h4>
                    <p className="text-blue-700 dark:text-blue-400 mb-2">Email: dpo@2sweety.com</p>
                    <p className="text-blue-700 dark:text-blue-400 mb-2">Response time: Within 72 hours</p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      Our DPO is available to answer questions about our data processing activities, 
                      your rights under GDPR, and to assist with privacy-related concerns.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supervisory Authority */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>6. Supervisory Authority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                You have the right to lodge a complaint with a supervisory authority:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-700/30">
                  <h4 className="font-semibold mb-3 dark:text-gray-200">🏛️ Supervisory Authority:</h4>
                  <p className="text-sm opacity-90 mb-1 dark:text-gray-300">Swedish Data Protection Authority (IMY)</p>
                  <p className="text-sm opacity-90 dark:text-gray-300">imy.se</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact and Complaints */}
          <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-800 text-white shadow-xl border-0">
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-white drop-shadow-lg" />
              <h3 className="text-2xl font-bold mb-4 text-white">GDPR Rights and Complaints</h3>
              <p className="mb-6 text-blue-100 dark:text-gray-300">
                Contact us to exercise your GDPR rights or file a complaint
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">📧 Rights Requests:</h4>
                  <p className="text-sm text-blue-100 dark:text-gray-300 mb-2">dpo@2sweety.com</p>
                  <p className="text-sm text-blue-100 dark:text-gray-300">privacy@2sweety.com</p>
                </div>
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">🏛️ Supervisory Authority:</h4>
                  <p className="text-sm text-blue-100 dark:text-gray-300 mb-1">Swedish Data Protection Authority (IMY)</p>
                  <p className="text-sm text-blue-100 dark:text-gray-300">imy.se</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-blue-200 dark:text-gray-300">
                <p>For EU Citizens: You have the right to file a complaint with your local Data Protection Authority</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GDPRCompliance;
