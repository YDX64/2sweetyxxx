import { useState } from "react";
import { Header } from "@/components/Header";
import { ViewManager } from "@/components/ViewManager";
import { NavigationBar } from "@/components/NavigationBar";
import { NotificationPopup } from "@/components/NotificationPopup";
import { useAuth } from "@/hooks/useAuth";

export const AppNavigation = () => {
  const [currentView, setCurrentView] = useState("discover");
  const { user } = useAuth();

  const handleViewChange = (view: string) => {
    console.log('Changing view to:', view);
    setCurrentView(view);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 min-h-0 overflow-y-auto pb-20">
        <ViewManager currentView={currentView} />
      </main>
      
      {user && (
        <NotificationPopup />
      )}
      
      {user && (
        <NavigationBar currentView={currentView} onViewChange={handleViewChange} />
      )}
    </div>
  );
};
