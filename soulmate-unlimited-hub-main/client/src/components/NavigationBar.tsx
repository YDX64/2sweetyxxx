import { Heart, Settings, User, Flame, Eye, Star, Crown, MessageCircle, HeartHandshake, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface NavigationBarProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export const NavigationBar = ({ currentView, onViewChange }: NavigationBarProps) => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  // URL'den current view'i belirle
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === "/" || path === "/discover") return "discover";
    if (path === "/matches") return "matches";
    if (path === "/likes") return "likes";
    if (path === "/messages") return "messages";
    if (path === "/guests") return "guests";
    if (path === "/upgrades") return "upgrades";
    if (path.startsWith("/profile")) return "profile";
    if (path === "/settings") return "settings";
    return currentView || "discover";
  };

  const activeView = getCurrentView();

  // Ana butonlar - mobilde her zaman görünür
  const primaryItems = [
    {
      id: "discover",
      icon: Flame,
      label: t("discover"),
      activeColor: "text-orange-500",
      activeBg: "bg-orange-50",
      activeBorder: "border-orange-200",
      path: "/"
    },
    {
      id: "matches",
      icon: HeartHandshake,
      label: t("matches"),
      activeColor: "text-pink-500",
      activeBg: "bg-pink-50",
      activeBorder: "border-pink-200",
      path: "/matches"
    },
    {
      id: "likes",
      icon: Heart,
      label: t("likes"),
      activeColor: "text-red-500",
      activeBg: "bg-red-50",
      activeBorder: "border-red-200",
      path: "/likes"
    },
    {
      id: "guests",
      icon: Eye,
      label: t("myVisitors"),
      activeColor: "text-purple-500",
      activeBg: "bg-purple-50",
      activeBorder: "border-purple-200",
      path: "/guests"
    },
    {
      id: "upgrades",
      icon: Crown,
      label: t("premium"),
      activeColor: "text-yellow-500",
      activeBg: "bg-yellow-50",
      activeBorder: "border-yellow-200",
      path: "/upgrades"
    }
  ];

  // Mobilde "More" dropdown'ında görünecek butonlar (sadece 3 tane)
  const moreItems = [
    {
      id: "messages",
      icon: MessageCircle,
      label: t("messages"),
      activeColor: "text-blue-500",
      activeBg: "bg-blue-50",
      activeBorder: "border-blue-200",
      path: "/messages"
    },
    {
      id: "profile",
      icon: User,
      label: t("profile"),
      activeColor: "text-gray-600",
      activeBg: "bg-gray-50",
      activeBorder: "border-gray-200",
      path: "/profile"
    },
    {
      id: "settings",
      icon: Settings,
      label: t("settings"),
      activeColor: "text-gray-600",
      activeBg: "bg-gray-50",
      activeBorder: "border-gray-200",
      path: "/settings"
    }
  ];

  // Tüm butonlar - desktop için
  const allItems = [...primaryItems, ...moreItems];

  const renderNavigationButton = (item: typeof primaryItems[0]) => {
    const IconComponent = item.icon;
    const isActive = activeView === item.id;
    
    return (
      <Link
        key={item.id}
        to={item.path}
        onClick={() => onViewChange?.(item.id)}
        className={`relative flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all duration-300 transform min-w-[64px] md:min-w-[60px] ${
          isActive
            ? `${item.activeBg} dark:bg-gray-800 scale-110 -translate-y-1 shadow-sm`
            : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105'
        }`}
      >
        {/* Icon with creative styling */}
        <div className={`relative transition-all duration-300 ${
          isActive ? 'transform scale-110' : ''
        }`}>
          <IconComponent
            className={`w-7 h-7 md:w-6 md:h-6 transition-all duration-300 ${
              isActive
                ? item.activeColor + ' drop-shadow-sm'
                : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
            }`}
          />
          
          {/* Subtle glow effect for active items */}
          {isActive && (
            <div className={`absolute inset-0 ${item.activeColor} opacity-20 blur-sm scale-125`}>
              <IconComponent className="w-7 h-7 md:w-6 md:h-6" />
            </div>
          )}
        </div>
        
        {/* Label with better typography */}
        <span className={`text-[10px] md:text-[9px] font-semibold mt-1 transition-all duration-300 text-center ${
          isActive
            ? item.activeColor
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {item.label}
        </span>
        
        {/* Subtle border for active state */}
        {isActive && (
          <div className={`absolute inset-0 border ${item.activeBorder} dark:border-gray-600 rounded-xl`}></div>
        )}
      </Link>
    );
  };

  const hasActiveMoreItem = moreItems.some(item => activeView === item.id);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 py-2 md:py-3 z-[90] shadow-lg safe-area-pb">
      <div className="flex justify-center items-center max-w-2xl mx-auto gap-1">
        {/* Desktop: Tüm butonları göster */}
        <div className="hidden md:flex gap-1">
          {allItems.map(renderNavigationButton)}
        </div>

        {/* Mobile: Ana butonlar + More dropdown */}
        <div className="flex md:hidden gap-1">
          {/* Ana butonlar */}
          {primaryItems.map(renderNavigationButton)}
          
          {/* More dropdown butonu */}
          <DropdownMenu open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={`relative flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all duration-300 transform min-w-[64px] md:min-w-[60px] ${
                  hasActiveMoreItem
                    ? 'bg-gray-50 dark:bg-gray-800 scale-110 -translate-y-1 shadow-sm'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105'
                }`}
              >
                <div className={`relative transition-all duration-300 ${
                  hasActiveMoreItem ? 'transform scale-110' : ''
                }`}>
                  <MoreHorizontal
                    className={`w-7 h-7 md:w-6 md:h-6 transition-all duration-300 ${
                      hasActiveMoreItem
                        ? 'text-gray-600 drop-shadow-sm'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                  
                  {/* Subtle glow effect for active state */}
                  {hasActiveMoreItem && (
                    <div className="absolute inset-0 text-gray-600 opacity-20 blur-sm scale-125">
                      <MoreHorizontal className="w-7 h-7 md:w-6 md:h-6" />
                    </div>
                  )}
                </div>
                
                <span className={`text-[10px] md:text-[9px] font-semibold mt-1 transition-all duration-300 text-center ${
                  hasActiveMoreItem
                    ? 'text-gray-600'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {t("more")}
                </span>
                
                {/* Subtle border for active state */}
                {hasActiveMoreItem && (
                  <div className="absolute inset-0 border border-gray-200 dark:border-gray-600 rounded-xl"></div>
                )}
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent
              align="center"
              side="top"
              className="mb-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50"
            >
              {moreItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <DropdownMenuItem key={item.id} asChild>
                    <Link
                      to={item.path}
                      onClick={() => {
                        onViewChange?.(item.id);
                        setIsMoreOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ${
                        isActive
                          ? `${item.activeColor} ${item.activeBg}`
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${
                          isActive ? item.activeColor : 'text-gray-500'
                        }`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
