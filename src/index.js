import React from 'react';
import ReactDOM from 'react-dom/client';
// Import CSS files - order matters for proper cascade
import './css/bootstrap.min.css';
import './css/style.css';
import './css/responsive.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { I18nextProvider } from 'react-i18next';
import i18n from './Language'; // Initialize i18n
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

const portalRoot = document.createElement('div');
portalRoot.id = 'portal-root';
document.body.appendChild(portalRoot);

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '630419143615-bjtr3e3bfrjtr65qgsb4sgu6cle4t2ar.apps.googleusercontent.com';

const AppWithProviders = () => {
  const googleClientId = GOOGLE_CLIENT_ID;
  const hasValidGoogleClientId = true; // Google is configured

  const app = (
    <I18nextProvider i18n={i18n}>
      <AgoraRTCProvider client={client}>
        <App />
      </AgoraRTCProvider>
    </I18nextProvider>
  );

  if (hasValidGoogleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {app}
      </GoogleOAuthProvider>
    );
  }

  return app;
};

root.render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);

reportWebVitals();
