import React from 'react';
import ReactDOM from 'react-dom/client';
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

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}>
      <I18nextProvider i18n={i18n}>
        <AgoraRTCProvider client={client}>
          <App />
        </AgoraRTCProvider>
      </I18nextProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
