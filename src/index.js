import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/bootstrap.min.css';
import './css/style.css';
import './css/responsive.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { ThemeProvider } from './Context/ThemeContext';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

const portalRoot = document.createElement('div');
portalRoot.id = 'portal-root';
document.body.appendChild(portalRoot);

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AgoraRTCProvider client={client}>
        <App />
      </AgoraRTCProvider>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
