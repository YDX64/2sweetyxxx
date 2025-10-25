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
            {t("privacyPolicy")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your privacy is our priority. Learn how we collect, use, and protect your personal information.
          </p>
          <div className="mt-6 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            Last updated: December 2024
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Privacy Overview */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span>Privacy at a Glance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                At 2Sweety, we are committed to protecting your privacy and ensuring the security of your personal data. 
                This policy complies with GDPR and other international privacy regulations.
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Lock className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">256-bit SSL</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Encryption</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Database className="w-8 h-8 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">Secure Storage</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Encrypted Databases</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Eye className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">Your Control</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Privacy Settings</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                  <Globe className="w-8 h-8 text-orange-500 dark:text-orange-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm dark:text-gray-200">GDPR</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Compliant</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                We collect information to provide you with the best dating experience while maintaining your privacy and security.
              </p>
              
              <div className="space-y-4">
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Information You Provide (Mandatory)</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>Name, age, and gender</li>
                    <li>Email address and phone number</li>
                    <li>Profile photos and bio</li>
                    <li>Location (for matching purposes)</li>
                    <li>Interests and preferences</li>
                  </ul>
                </div>
                
                <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">Optional Information</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>Education and occupation details</li>
                    <li>Social media connections</li>
                    <li>Additional profile information</li>
                    <li>Premium feature preferences</li>
                  </ul>
                </div>
                
                <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-900/10">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">Automatically Collected</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>Device information and IP address</li>
                    <li>App usage analytics</li>
                    <li>Location data (with permission)</li>
                    <li>Log files and crash reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We use your information for the following purposes:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-pink-500 dark:text-pink-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">Service Delivery</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Creating matches, enabling communication, and personalizing your experience</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">Security & Verification</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Preventing fraud, ensuring safety, and maintaining community standards</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Database className="w-5 h-5 text-green-500 dark:text-green-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">Service Improvement</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Analytics, research, and developing new features</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-purple-500 dark:text-purple-400 mt-1" />
                    <div>
                      <p className="font-semibold dark:text-gray-200">Communication</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sending notifications, updates, and customer support</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We never sell your personal information. We may share your information only in the following limited circumstances:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong className="dark:text-gray-200">With Other Users:</strong> Profile information you choose to display publicly</li>
                <li><strong className="dark:text-gray-200">Service Providers:</strong> Trusted partners who help us operate our service</li>
                <li><strong className="dark:text-gray-200">Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong className="dark:text-gray-200">Business Transfers:</strong> In case of merger or acquisition (with notice)</li>
              </ul>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300 font-semibold">We Never Share:</p>
                <p className="text-red-700 dark:text-red-400 text-sm">Your private messages, financial information, or precise location data with third parties for marketing purposes.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>4. Data Security Measures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We implement comprehensive security measures to protect your data:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 dark:text-gray-200">Technical Safeguards:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>256-bit SSL encryption</li>
                    <li>Encrypted database storage</li>
                    <li>Regular security audits</li>
                    <li>Secure data centers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 dark:text-gray-200">Operational Safeguards:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>Employee training programs</li>
                    <li>Access controls and monitoring</li>
                    <li>Incident response procedures</li>
                    <li>ISO 27001 compliance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>5. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Under GDPR, you have the following rights regarding your personal data:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-sm dark:text-gray-200">Right to Access</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">Request copies of your personal data</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-sm dark:text-gray-200">Right to Correction</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">Update or correct inaccurate information</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-semibold text-sm dark:text-gray-200">Right to Deletion</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">Request deletion of your data</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-semibold text-sm dark:text-gray-200">Right to Portability</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">Export your data in readable format</p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-300 font-semibold">Exercise Your Rights</p>
                <p className="text-blue-700 dark:text-blue-400 text-sm">Contact privacy@2sweety.com or use the settings in your app to exercise these rights.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We retain your data only as long as necessary for the purposes outlined in this policy:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">Data Type</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">Retention Period</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Profile Information</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Until account deletion</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Service provision</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Messages</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">1 year after deletion</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Safety investigation</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Usage Analytics</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">2 years</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Service improvement</td>
                    </tr>
                    <tr className="dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Support Records</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">3 years</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">Legal compliance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="dark:bg-gray-800/80 dark:border-gray-600/50">
            <CardHeader>
              <CardTitle>7. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We use cookies and similar technologies to improve your experience:
              </p>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold dark:text-gray-200">Essential Cookies</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Required for basic app functionality and security</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-semibold dark:text-gray-200">Analytics Cookies</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Help us understand how you use our service (with consent)</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-semibold dark:text-gray-200">Preference Cookies</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remember your settings and preferences</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can manage cookie preferences in your browser settings or through our privacy settings.
              </p>
            </CardContent>
          </Card>

          {/* Contact and DPO */}
          <Card className="bg-gradient-to-br from-green-600 via-green-700 to-blue-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-800 text-white shadow-xl border-0">
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-white drop-shadow-lg" />
              <h3 className="text-2xl font-bold mb-4 text-white">Data Protection Officer</h3>
              <p className="mb-6 text-green-100 dark:text-gray-300">
                Our Data Protection Officer is available to help with privacy-related questions
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">🛡️ Data Protection:</h4>
                  <p className="text-sm text-green-100 dark:text-gray-300 mb-2">dpo@2sweety.com</p>
                  <p className="text-sm text-green-100 dark:text-gray-300">Privacy Officer</p>
                </div>
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">📧 General Privacy:</h4>
                  <p className="text-sm text-green-100 dark:text-gray-300 mb-1">privacy@2sweety.com</p>
                  <p className="text-sm text-green-100 dark:text-gray-300">Privacy Team</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-green-200 dark:text-gray-300">
                <p>Response within 72 hours • GDPR Compliant • Multi-language support</p>
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
