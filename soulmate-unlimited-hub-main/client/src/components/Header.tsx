import { LanguageSelector } from "@/components/LanguageSelector";
import { NotificationDropdown } from "@/components/header/NotificationDropdown";
import { UserAccountDropdown } from "@/components/header/UserAccountDropdown";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Flame, Heart, MessageCircle, Crown, Sun, Moon, Menu, X, Settings, LogOut, User, Globe, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export const Header = ({
  onLoginClick,
  onRegisterClick
}: HeaderProps) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Default navigation handlers when props are not provided
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else if (location.pathname === '/') {
      // If we're already on home, just show auth form in login mode
      window.dispatchEvent(new CustomEvent('showAuth', { detail: { show: true } }));
      window.dispatchEvent(new CustomEvent('authModeChange', { detail: { mode: 'login' } }));
    } else {
      // Navigate to home and show auth form
      navigate('/');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('showAuth', { detail: { show: true } }));
        window.dispatchEvent(new CustomEvent('authModeChange', { detail: { mode: 'login' } }));
      }, 100);
    }
  };

  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else if (location.pathname === '/') {
      // If we're already on home, just show auth form in signup mode
      window.dispatchEvent(new CustomEvent('showAuth', { detail: { show: true } }));
      window.dispatchEvent(new CustomEvent('authModeChange', { detail: { mode: 'signup' } }));
    } else {
      // Navigate to home and show auth form
      navigate('/');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('showAuth', { detail: { show: true } }));
        window.dispatchEvent(new CustomEvent('authModeChange', { detail: { mode: 'signup' } }));
      }, 100);
    }
  };

  const mainNavItems = [
    { path: "/", icon: Flame, label: t("discover") },
    { path: "/matches", icon: Heart, label: t("matches") },
    { path: "/messages", icon: MessageCircle, label: t("messages") },
    { path: "/upgrades", icon: Crown, label: t("premium") }
  ];

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="container-app py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link 
              to="/"
              className="rounded-lg interactive-element group relative outline-none focus:outline-none block"
            >
              <div className="relative">
                <img 
                  src="/lovable-uploads/17b4c7b9-b9dd-4221-9182-7bf5cf47e3b3.png" 
                  alt="2Sweety Logo" 
                  className="h-8 w-auto transition-transform group-hover:scale-105 brightness-110 saturate-110 relative z-10" 
                  loading="eager"
                />
                {/* Shimmer animation - sadece light modda */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out z-20 dark:hidden"></div>
              </div>
            </Link>
            
            {/* Main Navigation - Hidden on mobile, sadece authenticated kullanıcılar için */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1">
                {mainNavItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Desktop View - Show all items */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Selector */}
              <div className="flex-shrink-0">
                <LanguageSelector />
              </div>

              {/* Theme Toggle */}
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>

              {/* Notification Dropdown - sadece authenticated kullanıcılar için */}
              {user && (
                <NotificationDropdown />
              )}
              
              {/* User Account Dropdown */}
              <UserAccountDropdown 
                onLoginClick={handleLoginClick}
                onRegisterClick={handleRegisterClick}
              />
            </div>

            {/* Mobile View - Theme + Language + Notification + Hamburger Menu */}
            <div className="flex md:hidden items-center space-x-1">
              {/* Theme Toggle - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-10 w-10 px-0 hover:bg-pink-100 dark:hover:bg-pink-900/30"
              >
                {theme === 'light' ? 
                  <Sun className="h-5 w-5 text-yellow-500" /> : 
                  <Moon className="h-5 w-5 text-blue-400" />
                }
              </Button>

              {/* Language Selector - Mobile */}
              <div className="scale-90">
                <LanguageSelector />
              </div>

              {/* Notification Dropdown - mobile'da da göster */}
              {user && (
                <NotificationDropdown />
              )}

              {/* Hamburger Menu - Bigger */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 px-0 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                  >
                    <Menu className="h-6 w-6 text-gray-600 dark:text-white" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0 bg-gradient-to-br from-pink-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-l-4 border-pink-200 dark:border-pink-800">
                  <div className="flex flex-col h-full">
                    {/* Sheet Header with gradient */}
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">{t('menu')}</h2>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMobileMenuOpen(false)}
                            className="h-8 w-8 px-0 hover:bg-white/20 text-white"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        {user && (
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden">
                              {user.user_metadata?.avatar_url ? (
                                <img 
                                  src={user.user_metadata.avatar_url} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                  loading="eager"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.email?.split('@')[0]}</p>
                              <p className="text-white/70 text-sm">{t('welcomeBack')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sheet Content - Simplified */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-6 space-y-4">
                        {/* Theme & Language Row */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Theme Toggle */}
                          <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {theme === 'light' ? 
                              <Sun className="w-5 h-5 text-yellow-500" /> : 
                              <Moon className="w-5 h-5 text-blue-400" />
                            }
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {theme === 'light' ? 'Light' : 'Dark'}
                            </span>
                          </button>

                          {/* Language Selector - Compact */}
                          <div className="relative">
                            <LanguageSelector />
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                        {/* Menu Items */}
                        {user ? (
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                navigate('/profile');
                                setMobileMenuOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <User className="w-5 h-5 text-pink-500" />
                              <span className="flex-1 text-left font-medium text-gray-700 dark:text-gray-200">{t('profile')}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>

                            <button
                              onClick={() => {
                                navigate('/settings');
                                setMobileMenuOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Settings className="w-5 h-5 text-purple-500" />
                              <span className="flex-1 text-left font-medium text-gray-700 dark:text-gray-200">{t('settings')}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>

                            <button
                              onClick={() => {
                                navigate('/upgrades');
                                setMobileMenuOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Crown className="w-5 h-5 text-yellow-500" />
                              <span className="flex-1 text-left font-medium text-gray-700 dark:text-gray-200">{t('premium')}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>

                            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

                            <button
                              onClick={async () => {
                                await signOut();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <LogOut className="w-5 h-5 text-red-500" />
                              <span className="flex-1 text-left font-medium text-red-600 dark:text-red-400">{t('signOut')}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Button
                              onClick={() => {
                                handleLoginClick();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full h-12 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-all"
                            >
                              {t('signIn')}
                            </Button>
                            <Button
                              onClick={() => {
                                handleRegisterClick();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full h-12 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                            >
                              {t('signUp')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 px-0 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 rounded-full outline-none focus:outline-none focus:ring-2 focus:ring-pink-500/20"
      aria-label={theme === 'light' ? 'Karanlık mod' : 'Aydınlık mod'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-gray-600 dark:text-white transition-all hover:scale-110" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500 transition-all hover:scale-110" />
      )}
    </Button>
  );
};
