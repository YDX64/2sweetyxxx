import { Heart, Sparkles, Users, MessageCircle, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

export const LandingPage = ({ onGetStarted, onLoginClick }: LandingPageProps) => {
  const { t } = useLanguage();

  console.log('LandingPage rendered - testimonials fotoğrafları kontrol ediliyor');

  return (
    <div className="min-h-screen bg-white flex flex-col dark:bg-gray-900">
      <Header onLoginClick={onLoginClick} onRegisterClick={onGetStarted} />
      
      {/* Hero Section */}
      <section className="relative bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-red-500/5 dark:from-pink-500/10 dark:to-red-500/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="flex items-center mb-6">
                <img 
                  src="/lovable-uploads/17b4c7b9-b9dd-4221-9182-7bf5cf47e3b3.png" 
                  alt="2Sweety Logo" 
                  className="h-12 mr-3"
                />
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gray-800 dark:text-white">{t('heroTitlePart1')}</span>
                <br />
                <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
                  {t('heroTitlePart2')}
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {t('heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {t('heroStartButton')}
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 px-8 py-4 text-lg rounded-full transition-all duration-300"
                >
                  {t('howItWorks')}
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-green-500" />
                  <span>{t('trustSafeVerified')}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{t('trustRating')}</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Hero Image/Graphics */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/20 dark:to-red-900/20 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {/* Sample Profile Cards - Portrait oriented */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-pink-300 to-red-300 rounded-xl mb-3 relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face"
                        alt={t('profileImageAlt')}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{t('profileExample1Name')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('heroProfileCity1')}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8">
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-orange-300 to-red-300 rounded-xl mb-3 relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face"
                        alt="Profile"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{t('profileExample2Name')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('heroProfileCity2')}</p>
                  </div>
                </div>
                
                {/* Floating Hearts */}
                <div className="absolute -top-4 -right-4 text-pink-500">
                  <Heart className="w-8 h-8 animate-pulse" fill="currentColor" />
                </div>
                <div className="absolute -bottom-4 -left-4 text-red-500">
                  <Heart className="w-6 h-6 animate-pulse" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {t('whyTitle')} <span className="text-pink-500">2Sweety</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('whyDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('smartMatching')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('smartMatchingDesc')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('safeEnvironment')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('safeEnvironmentDesc')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('instantConnection')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('instantConnectionDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">{t('successStories')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t('realStoriesFromCouples')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "{t('testimonial1')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full mr-3 overflow-hidden">
                  <OptimizedImage 
                    src="/media/images/sara_1.jpg"
                    alt="Zeynep"
                    fallbackSrc="/media/images/default_female.jpg"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">{t('testimonialCouple1')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('testimonialCity1')}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "{t('testimonial2')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full mr-3 overflow-hidden">
                  <OptimizedImage 
                    src="/media/images/emma_1.jpg"
                    alt="Selin"
                    fallbackSrc="/media/images/default_female.jpg"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">{t('testimonialCouple2')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('testimonialCity2')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "{t('testimonial3')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full mr-3 overflow-hidden">
                  <OptimizedImage 
                    src="/media/images/erik_1.jpg"
                    alt="Deniz"
                    fallbackSrc="/media/images/default_male.jpg"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">{t('testimonialCouple3')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('testimonialCity3')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">{t('howItWorks')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('howItWorksSubtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('step1Title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t('step1Description')}
              </p>
              <Button 
                onClick={onGetStarted}
                variant="outline" 
                className="border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              >
                {t('step1Button')}
              </Button>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('step2Title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t('step2Description')}
              </p>
              <Button 
                onClick={onGetStarted}
                variant="outline" 
                className="border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Heart className="w-4 h-4 mr-2" />
                {t('step2Button')}
              </Button>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('step3Title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t('step3Description')}
              </p>
              <Button 
                onClick={onGetStarted}
                variant="outline" 
                className="border-gray-200 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/80"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('step3Button')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('premiumFeaturesTitle')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('premiumFeaturesSubtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('superLikeFeatureTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {t('superLikeFeatureDescription')}
              </p>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">∞</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('superLikeFeatureDetail')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whoLikesYouFeatureTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {t('whoLikesYouFeatureDescription')}
              </p>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">👀</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('whoLikesYouFeatureDetail')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('incognitoModeTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {t('incognitoModeDescription')}
              </p>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">🥷</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('incognitoModeDetail')}</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Star className="w-6 h-6 mr-2" />
              {t('upgradeToPremiumButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            {t('findYourLove')}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('ctaDescription')}
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-12 py-4 text-xl font-semibold rounded-full shadow-2xl hover:shadow-pink-500/25 dark:shadow-pink-500/10 transition-all duration-300 transform hover:scale-105 border border-transparent dark:border-pink-500/20"
          >
            <Heart className="w-6 h-6 mr-2" />
            {t('startNowFree')}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};
