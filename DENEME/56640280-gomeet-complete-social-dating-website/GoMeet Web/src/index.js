import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

const portalRoot = document.createElement('div');
portalRoot.id = 'portal-root';
document.body.appendChild(portalRoot);

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

root.render(
  <React.StrictMode>
    <AgoraRTCProvider client={client}>
      <App />
    </AgoraRTCProvider>
  </React.StrictMode>
);

reportWebVitals();
