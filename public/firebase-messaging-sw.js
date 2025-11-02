importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// 2Sweety Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to",
  authDomain: "sweet-a6718.firebaseapp.com",
  projectId: "sweet-a6718",
  storageBucket: "sweet-a6718.firebasestorage.app",
  messagingSenderId: "487435792097",
  appId: "1:487435792097:web:12907427892d53c82251a0",
  measurementId: "G-EQGMN8DYDP"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
