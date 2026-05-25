// ════════════════════════════════════════════
// THE FRIDGE — Firebase Configuration
//
// !! COMPLETEAZĂ CU DATELE DIN FIREBASE CONSOLE !!
// (pasul exact e descris în instrucțiunile de setup)
// ════════════════════════════════════════════

const firebaseConfig = {
  apiKey:            "AIzaSyB9uuBwPeylVMFywAqfiAQRgdsgu7b42Do",
  authDomain:        "thefridge-fb5df.firebaseapp.com",
  projectId:         "thefridge-fb5df",
  storageBucket:     "thefridge-fb5df.firebasestorage.app",
  messagingSenderId: "545404314304",
  appId:             "1:545404314304:web:2bb919c64085a978940325"
};

// Inițializare Firebase
firebase.initializeApp(firebaseConfig);

// Servicii globale (accesibile din app.js)
const auth = firebase.auth();
const db   = firebase.firestore();

// Sesiunea persistă local — userul rămâne logat după ce închide browserul
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
