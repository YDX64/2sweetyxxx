import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Globe, Users, Star, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-full pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <img 
                src="/lovable-uploads/17b4c7b9-b9dd-4221-9182-7bf5cf47e3b3.png" 
                alt="2Sweety Logo" 
                className="h-8 transition-transform group-hover:scale-105"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                2Sweety
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md">
              {t('footerDescription')}
            </p>
            <div className="flex items-center space-x-6 pt-2">
              <div className="flex items-center space-x-2 text-pink-500 dark:text-pink-400">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">{t('footerMatchesMade')}</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-500 dark:text-blue-400">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">{t('footerActiveUsers')}</span>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('footerFeatures')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                <Heart className="w-4 h-4" />
                <span>{t('footerSmartMatching')}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{t('footerVideoChat')}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                <Shield className="w-4 h-4" />
                <span>{t('footerSafeSecure')}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                <Star className="w-4 h-4" />
                <span>{t('footerPremiumExperience')}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                <Globe className="w-4 h-4" />
                <span>{t('footerGlobalCommunity')}</span>
              </div>
            </div>
          </div>

          {/* Download Apps Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('footerDownloadApp')}</h3>
            <div className="space-y-3">
              {/* Google Play Store Button */}
              <a 
                href="https://play.google.com/store/apps/details?id=com.sweety.dating"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 hover:bg-gray-700 rounded-xl p-3 transition-all duration-300 transform hover:scale-105 border border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <defs>
                          <linearGradient id="google-play-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00D4FF"/>
                            <stop offset="50%" stopColor="#00A8FF"/>
                            <stop offset="100%" stopColor="#0088FF"/>
                          </linearGradient>
                        </defs>
                        <path d="M3 20.5V3.5C3 2.4 3.89 1.5 5 1.5C5.33 1.5 5.66 1.58 5.95 1.73L14.05 6.5L5.95 11.27C5.66 11.42 5.33 11.5 5 11.5C3.89 11.5 3 10.6 3 9.5V20.5C3 21.6 3.89 22.5 5 22.5C5.33 22.5 5.66 22.42 5.95 22.27L14.05 17.5L5.95 12.73C5.66 12.58 5.33 12.5 5 12.5C3.89 12.5 3 13.4 3 14.5V20.5Z" fill="url(#google-play-gradient)"/>
                        <path d="M14.5 12L18.5 15L14.5 18V15H14.5V12Z" fill="#FFD600"/>
                        <path d="M14.5 6L18.5 9L14.5 12V9H14.5V6Z" fill="#FF4444"/>
                        <path d="M10.5 12L14.5 8L14.5 16L10.5 12Z" fill="#00E676"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">{t('footerGetItOn')}</div>
                      <div className="text-sm font-semibold text-white">{t('footerGooglePlay')}</div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="black">
                        <path d="M3 3h18v18H3V3zm1 1v16h16V4H4zm2 2h12v12H6V6zm1 1v10h10V7H7zm1 1h8v8H8V8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </a>

              {/* Apple App Store Button */}
              <a 
                href="https://apps.apple.com/app/2sweety-dating/id1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 hover:bg-gray-700 rounded-xl p-3 transition-all duration-300 transform hover:scale-105 border border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#FFFFFF"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">{t('footerDownloadOn')}</div>
                      <div className="text-sm font-semibold text-white">{t('footerAppStore')}</div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="black">
                        <path d="M3 3h18v18H3V3zm1 1v16h16V4H4zm2 2h12v12H6V6zm1 1v10h10V7H7zm1 1h8v8H8V8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </a>

              {/* App Info */}
              <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('footerAvailableOn')}</p>
                <div className="flex justify-center space-x-4">
                  <span className="text-xs text-gray-500 dark:text-gray-500">{t('footerIosVersion')}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">{t('footerAndroidVersion')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">{t('footerCopyright')}</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link 
                to="/about"
                className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm"
              >
                {t('aboutUs')}
              </Link>
              <Link 
                to="/privacy-policy"
                className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm"
              >
                {t('privacyPolicy')}
              </Link>
              <Link 
                to="/terms-of-service"
                className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm"
              >
                {t('termsOfService')}
              </Link>
              <Link 
                to="/gdpr"
                className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm"
              >
                {t('gdpr')}
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
              {t('footerBottomDescription')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
