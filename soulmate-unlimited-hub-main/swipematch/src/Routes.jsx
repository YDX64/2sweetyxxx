import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import LoginRegisterScreen from "pages/login-register-screen";
import ProfileDiscoverySwipeScreen from "pages/profile-discovery-swipe-screen";
import ProfileCreationEditScreen from "pages/profile-creation-edit-screen";
import MatchesConversationsList from "pages/matches-conversations-list";
import ChatMessagingScreen from "pages/chat-messaging-screen";
import UserSettingsPreferences from "pages/user-settings-preferences";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<LoginRegisterScreen />} />
          <Route path="/login-register-screen" element={<LoginRegisterScreen />} />
          <Route path="/profile-discovery-swipe-screen" element={<ProfileDiscoverySwipeScreen />} />
          <Route path="/profile-creation-edit-screen" element={<ProfileCreationEditScreen />} />
          <Route path="/matches-conversations-list" element={<MatchesConversationsList />} />
          <Route path="/chat-messaging-screen" element={<ChatMessagingScreen />} />
          <Route path="/user-settings-preferences" element={<UserSettingsPreferences />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;