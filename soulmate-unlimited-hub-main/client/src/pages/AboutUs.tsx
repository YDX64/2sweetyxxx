import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Shield, Award, Star, MapPin, Mail, Phone } from "lucide-react";

const AboutUs = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Heart className="w-16 h-16 text-pink-500 dark:text-pink-400 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800">2Sweety</Badge>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {t("aboutUs")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Connecting hearts worldwide with smart matching technology and genuine relationships since 2020.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Mission Statement */}
          <Card className="border-pink-200 dark:border-gray-700 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-800/50 dark:bg-gray-800/50">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Our Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                At 2Sweety, we believe everyone deserves to find meaningful love. Our mission is to create 
                authentic connections through innovative technology, fostering relationships that last a lifetime. 
                We're committed to providing a safe, inclusive, and enjoyable dating experience for millions worldwide.
              </p>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center border-blue-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">50M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
              </CardContent>
            </Card>
            <Card className="text-center border-green-200 dark:border-gray-700 bg-green-50 dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Heart className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">10M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </CardContent>
            </Card>
            <Card className="text-center border-purple-200 dark:border-gray-700 bg-purple-50 dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Award className="w-12 h-12 text-purple-500 dark:text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">2M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Couples</div>
              </CardContent>
            </Card>
            <Card className="text-center border-yellow-200 dark:border-gray-700 bg-yellow-50 dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Star className="w-12 h-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">99%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Our Values */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-red-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-gray-800 dark:text-gray-100">
                  <Shield className="w-8 h-8 text-red-500 dark:text-red-400" />
                  <span>Security First</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Advanced security protocols, verified profiles, and 24/7 moderation ensure 
                  your safety and privacy in every interaction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-gray-800 dark:text-gray-100">
                  <Heart className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                  <span>Authentic Connections</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Our smart algorithm focuses on compatibility, shared interests, and genuine 
                  personality matches rather than superficial criteria.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-gray-800 dark:text-gray-100">
                  <Star className="w-8 h-8 text-green-500 dark:text-green-400" />
                  <span>Quality Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Intuitive design, smooth user experience, and premium features designed 
                  to make finding love enjoyable and stress-free.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Section */}
          <Card className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-3xl text-gray-800 dark:text-gray-100">Meet Our Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
                Our diverse team of experts is dedicated to helping you find love
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Psychology Experts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Relationship specialists crafting better matches</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">AI Engineers</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Building smart matching algorithms</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Security Specialists</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ensuring your safety and privacy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Stories */}
          <Card className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-gray-800/50 dark:to-gray-800/50 dark:bg-gray-800/50 border-pink-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-3xl text-gray-800 dark:text-gray-100">Success Stories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-700/30 p-6 rounded-lg shadow-sm dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                    "Met my perfect match within 2 weeks! The matching algorithm is incredible. 
                    We're planning our wedding next year!"
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">— Sarah & Michael, New York</p>
                </div>
                <div className="bg-white dark:bg-gray-700/30 p-6 rounded-lg shadow-sm dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                    "Best dating app ever! Found my perfect match after trying many others. 
                    Thank you 2Sweety for bringing us together!"
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">— Emma & David, London</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-800 text-white shadow-xl border-0">
            <CardContent className="text-center py-8">
              <h3 className="text-2xl font-bold mb-6 text-white">Get in Touch</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <Mail className="w-8 h-8 mb-3 text-white drop-shadow-lg" />
                  <h4 className="font-semibold mb-2 text-white">General Inquiries</h4>
                  <p className="text-sm text-blue-100 dark:text-gray-300">info@2sweety.com</p>
                </div>
                <div className="flex flex-col items-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <Heart className="w-8 h-8 mb-3 text-white drop-shadow-lg" />
                  <h4 className="font-semibold mb-2 text-white">Customer Support</h4>
                  <p className="text-sm text-blue-100 dark:text-gray-300">support@2sweety.com</p>
                </div>
                <div className="flex flex-col items-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <MapPin className="w-8 h-8 mb-3 text-white drop-shadow-lg" />
                  <h4 className="font-semibold mb-2 text-white">Headquarters</h4>
                  <p className="text-sm text-blue-100 dark:text-gray-300">Stockholm, Sweden</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm text-blue-200 dark:text-gray-300">
                  Available 24/7 • Response within 24 hours • Multiple language support
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
