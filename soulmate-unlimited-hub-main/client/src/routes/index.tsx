import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Matches from "@/pages/Matches";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import { UpgradesPage } from "@/pages/UpgradesPage";
import { LikesPage } from "@/pages/LikesPage";
import { MessagesPage } from "@/pages/MessagesPage";
import { GuestsPage } from "@/pages/GuestsPage";
import { ILikedPage } from "@/pages/ILikedPage";
import AboutUs from "@/pages/AboutUs";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import GDPRCompliance from "@/pages/GDPRCompliance";
import AdminPanel from "@/pages/AdminPanel";
import SimpleAdminPanel from "@/pages/SimpleAdminPanel";
import ModeratorPanel from "@/pages/ModeratorPanel";
import UserDetail from "@/pages/admin/UserDetail";
import UserSubscription from "@/pages/admin/UserSubscription";
import ManualSubscription from "@/pages/admin/ManualSubscription";
import { ContentModeration } from "@/pages/admin/ContentModeration";

// Check if in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Conditionally load test routes only in development
let testRoutes: React.ReactElement | null = null;
if (isDevelopment) {
  // Dynamically import test routes only in development
  const TestRoutes = lazy(() => import('./testRoutes').then(module => ({ default: () => module.testRoutes })));
  testRoutes = (
    <Suspense fallback={null}>
      <TestRoutes />
    </Suspense>
  );
} else if (import.meta.env.MODE === 'production') {
  // Log warning if attempting to access test routes in production
  console.warn('Test routes are not available in production builds');
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/discover" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
      <Route path="/likes" element={<ProtectedRoute><LikesPage /></ProtectedRoute>} />
      <Route path="/i-liked" element={<ProtectedRoute><ILikedPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/guests" element={<ProtectedRoute><GuestsPage /></ProtectedRoute>} />
      <Route path="/upgrades" element={<ProtectedRoute><UpgradesPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/settings/profile" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      
      {/* Legal and Info Pages */}
      <Route path="/about" element={<AboutUs />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/gdpr" element={<GDPRCompliance />} />
      
      {/* Admin Panel */}
      <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminPanel /></ProtectedRoute>} />
      <Route path="/admin/users/:userId" element={<ProtectedRoute requireRole="admin"><UserDetail /></ProtectedRoute>} />
      <Route path="/admin/users/:userId/subscription" element={<ProtectedRoute requireRole="admin"><UserSubscription /></ProtectedRoute>} />
      <Route path="/admin/manual-subscription" element={<ProtectedRoute requireRole="admin"><ManualSubscription /></ProtectedRoute>} />
      <Route path="/admin/content-moderation" element={<ProtectedRoute requireRole="admin"><ContentModeration /></ProtectedRoute>} />
      <Route path="/moderator" element={<ProtectedRoute requireRole="moderator"><ModeratorPanel /></ProtectedRoute>} />
      
      {/* Test routes - only included in development builds */}
      {testRoutes}
      
      {/* Support Pages - TODO: Create these pages */}
      <Route path="/help" element={<NotFound />} />
      <Route path="/safety" element={<NotFound />} />
      <Route path="/community-guidelines" element={<NotFound />} />
      <Route path="/contact" element={<NotFound />} />
      <Route path="/feedback" element={<NotFound />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}