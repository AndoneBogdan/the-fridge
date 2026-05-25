// ════════════════════════════════════════════
// THE FRIDGE — FCM Service Worker
// Gestionează notificările când app-ul e ÎNCHIS
// ════════════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyB9uuBwPeylVMFywAqfiAQRgdsgu7b42Do',
  authDomain:        'thefridge-fb5df.firebaseapp.com',
  projectId:         'thefridge-fb5df',
  storageBucket:     'thefridge-fb5df.firebasestorage.app',
  messagingSenderId: '545404314304',
  appId:             '1:545404314304:web:2bb919c64085a978940325'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  if (!title) return;
  self.registration.showNotification(title, {
    body:  body || '',
    icon:  '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag:   'fridge-expiry'
  });
});
