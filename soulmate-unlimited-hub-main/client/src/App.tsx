import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { useEffect, Suspense } from "react";
import { initMobileFixes } from "@/utils/viewportHelper";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes (increased from 5)
      gcTime: 1000 * 60 * 30, // 30 minutes (increased from 10)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      refetchOnReconnect: true, // Keep this for network recovery
      refetchOnMount: 'always', // Always refetch on component mount
      refetchInterval: false, // No automatic polling
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize mobile fixes on mount
    const cleanup = initMobileFixes();
    
    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ConnectionStatus />
              <BrowserRouter>
                <AnalyticsProvider>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                    <AppRoutes />
                  </Suspense>
                </AnalyticsProvider>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
