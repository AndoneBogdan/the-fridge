// ════════════════════════════════════════════
// THE FRIDGE — Main App Logic
// Auth + Routing + Household management
// ════════════════════════════════════════════

// UID-ul tău de Super Admin (completează după ce creezi contul în Firebase)
const SUPER_ADMIN_UID = 'PFuBnC7V4JXDJBNOfWDthcScuky2';

// Stare globală a aplicației
let appState = {
  user:        null,
  userData:    null,
  householdId: null,
  household:   null,
  role:        null
};

// ────────────────────────────────────────────
// ROUTER — afișează un singur ecran
// ────────────────────────────────────────────
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }
}

// Dashboard + încărcare produse (products.js)
function showDashboard() {
  showScreen('screen-dashboard');
  if (typeof loadProducts === 'function') loadProducts();
  if (typeof initNotifications === 'function') initNotifications();
}

// ────────────────────────────────────────────
// TOAST
// ────────────────────────────────────────────
let toastTimer = null;

function showToast(message, type = 'info', duration = 3500) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), duration);
}

// ────────────────────────────────────────────
// HELPERS UI
// ────────────────────────────────────────────
function setBtnLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.querySelector('.btn-text')?.classList.toggle('hidden', loading);
  btn.querySelector('.btn-loader')?.classList.toggle('hidden', !loading);
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError(elId) {
  document.getElementById(elId)?.classList.add('hidden');
}

function resetBtnLoading(btnId) {
  setBtnLoading(btnId, false);
}

// ────────────────────────────────────────────
// HASH PAROLĂ (SHA-256 via Web Crypto)
// ────────────────────────────────────────────
async function hashPassword(password) {
  const salt    = 'thefridge-2025';
  const encoder = new TextEncoder();
  const data     = encoder.encode(password + salt);
  const hashBuf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// ────────────────────────────────────────────
// MESAJE ERORI FIREBASE AUTH
// ────────────────────────────────────────────
function getAuthErrorMsg(code) {
  const map = {
    'auth/user-not-found':        'Nu există un cont cu acest email.',
    'auth/wrong-password':        'Parolă incorectă.',
    'auth/invalid-credential':    'Email sau parolă incorectă.',
    'auth/email-already-in-use':  'Există deja un cont cu acest email.',
    'auth/invalid-email':         'Adresa de email nu este validă.',
    'auth/weak-password':         'Parola trebuie să aibă minim 6 caractere.',
    'auth/too-many-requests':     'Prea multe încercări. Încearcă mai târziu.',
    'auth/network-request-failed':'Eroare de rețea. Verifică conexiunea.',
  };
  return map[code] || 'A apărut o eroare. Încearcă din nou.';
}

// ────────────────────────────────────────────
// CULORI AVATAR RANDOM
// ────────────────────────────────────────────
function randomAvatarColor() {
  const colors = ['#1D9E75','#E74C3C','#3498DB','#F39C12','#9B59B6','#16A085','#E67E22'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ────────────────────────────────────────────
// GENERARE COD INVITAȚIE (6 caractere)
// ────────────────────────────────────────────
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // fără caractere confuzibile
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ════════════════════════════════════════════
// FIREBASE AUTH STATE OBSERVER
// Rulează la pornirea aplicației — decide unde
// îl trimitem pe user (login sau dashboard).
// ════════════════════════════════════════════
auth.onAuthStateChanged(async (user) => {
  // Ignorăm dacă ecranul de loading nu mai e activ
  // (navigarea directă din login/register o gestionăm acolo)
  const loadingScreen = document.getElementById('screen-loading');
  if (!loadingScreen.classList.contains('active')) return;

  if (!user) {
    showScreen('screen-login');
    return;
  }

  try {
    const userDoc  = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    if (userData?.householdId) {
      // Are frigider → du-l direct la dashboard
      const ok = await loadDashboard(user, userData);
      if (ok) { showDashboard(); } else { showScreen('screen-choose-path'); }
    } else {
      // Nu are frigider → choose path
      const name = userData?.name || user.displayName || 'Watch Member';
      document.getElementById('choose-path-greeting').textContent = `Bun venit, ${name}!`;
      showScreen('screen-choose-path');
    }
  } catch (err) {
    console.error('Auth state error:', err);
    showScreen('screen-login');
  }
});

// ────────────────────────────────────────────
// LOAD DASHBOARD — încarcă datele frigiderului
// ────────────────────────────────────────────
async function loadDashboard(user, userData) {
  const householdId = userData.householdId;
  try {
    const [householdDoc, memberDoc] = await Promise.all([
      db.collection('households').doc(householdId).get(),
      db.collection('households').doc(householdId).collection('members').doc(user.uid).get()
    ]);

    if (!householdDoc.exists) {
      // Frigiderul a fost șters — curățăm referința
      await db.collection('users').doc(user.uid).update({ householdId: null });
      return false;
    }

    const household = householdDoc.data();
    const role      = memberDoc.exists ? memberDoc.data().role : 'night_snaker';

    // Actualizăm state-ul global
    appState = { user, userData, householdId, household, role };

    // Setăm UI-ul
    document.getElementById('dashboard-fridge-name').textContent = household.name;
    document.getElementById('dashboard-role-badge').textContent  =
      role === 'lord_commander' ? '⚔️ Lord Commander' : '🌙 Night Snacker';

    return true;
  } catch (err) {
    console.error('loadDashboard error:', err);
    return false;
  }
}

// ════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('login-error');

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showError('login-error', 'Completează email-ul și parola.');
    return;
  }

  setBtnLoading('btn-login', true);

  try {
    const cred     = await auth.signInWithEmailAndPassword(email, password);
    const userDoc  = await db.collection('users').doc(cred.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    if (userData?.householdId) {
      const ok = await loadDashboard(cred.user, userData);
      if (ok) { showDashboard(); } else { showScreen('screen-choose-path'); }
    } else {
      const name = userData?.name || cred.user.displayName || 'Watch Member';
      document.getElementById('choose-path-greeting').textContent = `Bun venit, ${name}!`;
      showScreen('screen-choose-path');
    }
  } catch (err) {
    resetBtnLoading('btn-login');
    showError('login-error', getAuthErrorMsg(err.code));
  }
});

// ════════════════════════════════════════════
// REGISTER
// ════════════════════════════════════════════
document.getElementById('btn-go-register').addEventListener('click', () => {
  showScreen('screen-register');
});

document.getElementById('btn-back-to-login').addEventListener('click', () => {
  showScreen('screen-login');
});

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('register-error');

  const name      = document.getElementById('reg-name').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-password').value;
  const password2 = document.getElementById('reg-password2').value;

  if (!name || !email || !password || !password2) {
    showError('register-error', 'Completează toate câmpurile.');
    return;
  }
  if (name.length < 2) {
    showError('register-error', 'Numele trebuie să aibă minim 2 caractere.');
    return;
  }
  if (password !== password2) {
    showError('register-error', 'Parolele nu coincid.');
    return;
  }
  if (password.length < 6) {
    showError('register-error', 'Parola trebuie să aibă minim 6 caractere.');
    return;
  }

  setBtnLoading('btn-register', true);

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);

    // Creăm documentul userului în Firestore
    await db.collection('users').doc(cred.user.uid).set({
      name:         name,
      email:        email,
      avatarColor:  randomAvatarColor(),
      householdId:  null,
      createdAt:    firebase.firestore.FieldValue.serverTimestamp()
    });

    // Actualizăm displayName în Auth
    await cred.user.updateProfile({ displayName: name });

    // Navigare directă — nu așteptăm onAuthStateChanged
    document.getElementById('choose-path-greeting').textContent = `Bun venit, ${name}!`;
    showScreen('screen-choose-path');

  } catch (err) {
    resetBtnLoading('btn-register');
    showError('register-error', getAuthErrorMsg(err.code));
  }
});

// ════════════════════════════════════════════
// CHOOSE PATH
// ════════════════════════════════════════════
document.getElementById('btn-create-fridge').addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;

  // Pre-completăm numele frigiderului
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const name    = userDoc.exists ? userDoc.data().name : user.displayName || '';
    if (name) {
      document.getElementById('fridge-name').value = `The House of ${name}`;
    }
  } catch (_) { /* ignorăm — câmpul rămâne gol */ }

  showScreen('screen-create-household');
});

document.getElementById('btn-join-fridge').addEventListener('click', () => {
  showScreen('screen-join-household');
});

// ════════════════════════════════════════════
// CREATE HOUSEHOLD
// ════════════════════════════════════════════
document.getElementById('btn-back-to-choose').addEventListener('click', () => {
  showScreen('screen-choose-path');
});

document.getElementById('form-create-household').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('create-household-error');

  const fridgeName     = document.getElementById('fridge-name').value.trim();
  const fridgePassword = document.getElementById('fridge-password').value;

  if (!fridgeName) {
    showError('create-household-error', 'Introdu un nume pentru frigider.');
    return;
  }
  if (!fridgePassword || fridgePassword.length < 4) {
    showError('create-household-error', 'Parola frigiderului trebuie să aibă minim 4 caractere.');
    return;
  }

  setBtnLoading('btn-create-household', true);

  try {
    // ── Verificare cap beta (30 frigidere) ──
    const allHouseholds = await db.collection('households').get();
    if (allHouseholds.size >= 30) {
      resetBtnLoading('btn-create-household');
      document.getElementById('modal-beta').classList.remove('hidden');
      return;
    }

    const user    = auth.currentUser;
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (!userDoc.exists) throw new Error('user-not-found');

    const userData     = userDoc.data();
    const inviteCode   = generateInviteCode();
    const passwordHash = await hashPassword(fridgePassword);

    // Creăm frigiderul
    const householdRef = await db.collection('households').add({
      name:         fridgeName,
      passwordHash: passwordHash,
      inviteCode:   inviteCode,
      ownerId:      user.uid,
      createdAt:    firebase.firestore.FieldValue.serverTimestamp()
    });

    // Adăugăm Lord Commander ca member
    await db.collection('households').doc(householdRef.id)
      .collection('members').doc(user.uid).set({
        name:        userData.name,
        role:        'lord_commander',
        joinedAt:    firebase.firestore.FieldValue.serverTimestamp(),
        avatarColor: userData.avatarColor
      });

    // Linkăm frigiderul la user
    await db.collection('users').doc(user.uid).update({ householdId: householdRef.id });

    // Actualizăm state local
    const freshUserDoc = await db.collection('users').doc(user.uid).get();
    await loadDashboard(user, freshUserDoc.data());

    showToast(`Frigider creat! Cod invitație: ${inviteCode}`, 'success', 6000);
    showDashboard();

  } catch (err) {
    console.error('Create household error:', err);
    resetBtnLoading('btn-create-household');
    showError('create-household-error', 'Eroare la creare. Încearcă din nou.');
  }
});

// ════════════════════════════════════════════
// JOIN HOUSEHOLD
// ════════════════════════════════════════════
document.getElementById('btn-back-to-choose2').addEventListener('click', () => {
  showScreen('screen-choose-path');
});

// Forțăm uppercase pe câmpul de cod
document.getElementById('invite-code').addEventListener('input', (e) => {
  const pos = e.target.selectionStart;
  e.target.value = e.target.value.toUpperCase();
  e.target.setSelectionRange(pos, pos);
});

document.getElementById('form-join-household').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('join-household-error');

  const inviteCode = document.getElementById('invite-code').value.trim().toUpperCase();
  const password   = document.getElementById('join-password').value;

  if (inviteCode.length !== 6) {
    showError('join-household-error', 'Codul de invitație trebuie să aibă exact 6 caractere.');
    return;
  }
  if (!password) {
    showError('join-household-error', 'Introdu parola frigiderului.');
    return;
  }

  setBtnLoading('btn-join-household', true);

  try {
    // Căutăm frigiderul cu acest cod
    const snapshot = await db.collection('households')
      .where('inviteCode', '==', inviteCode)
      .limit(1)
      .get();

    if (snapshot.empty) {
      showError('join-household-error', 'Cod de invitație invalid. Verifică cu Lord Commander-ul.');
      resetBtnLoading('btn-join-household');
      return;
    }

    const householdDoc  = snapshot.docs[0];
    const household     = householdDoc.data();
    const enteredHash   = await hashPassword(password);

    if (enteredHash !== household.passwordHash) {
      showError('join-household-error', 'Parolă incorectă. Cere Lord Commander-ului parola corectă.');
      resetBtnLoading('btn-join-household');
      return;
    }

    // Verificăm limita de 6 membri
    const membersSnap = await db.collection('households')
      .doc(householdDoc.id).collection('members').get();

    if (membersSnap.size >= 6) {
      showError('join-household-error', 'Frigiderul este plin (maxim 6 Night Snackers).');
      resetBtnLoading('btn-join-household');
      return;
    }

    const user    = auth.currentUser;
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    // Verificăm dacă e deja membru
    const existingMember = await db.collection('households')
      .doc(householdDoc.id).collection('members').doc(user.uid).get();

    if (!existingMember.exists) {
      await db.collection('households').doc(householdDoc.id)
        .collection('members').doc(user.uid).set({
          name:        userData.name,
          role:        'night_snaker',
          joinedAt:    firebase.firestore.FieldValue.serverTimestamp(),
          avatarColor: userData.avatarColor
        });
    }

    await db.collection('users').doc(user.uid).update({ householdId: householdDoc.id });

    const freshUserDoc = await db.collection('users').doc(user.uid).get();
    await loadDashboard(user, freshUserDoc.data());

    showToast(`Te-ai alăturat la "${household.name}"! 🌙`, 'success');
    showDashboard();

  } catch (err) {
    console.error('Join household error:', err);
    resetBtnLoading('btn-join-household');
    showError('join-household-error', 'Eroare. Încearcă din nou.');
  }
});

// ════════════════════════════════════════════
// TOGGLE PAROLĂ VIZIBILĂ
// ════════════════════════════════════════════
document.querySelectorAll('.toggle-pwd').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.style.color = input.type === 'text' ? 'var(--accent)' : '';
  });
});

// ── Modal beta
document.getElementById('btn-close-beta').addEventListener('click', () => {
  document.getElementById('modal-beta').classList.add('hidden');
  document.getElementById('modal-success').classList.add('hidden');
  document.getElementById('modal-btns').classList.remove('hidden');
  document.getElementById('beta-consent').checked = false;
});

async function saveWaitlist(type) {
  const consent = document.getElementById('beta-consent').checked;
  if (!consent) {
    showToast('Bifează acordul pentru a continua.', 'info');
    return;
  }
  document.getElementById('btn-waitlist-free').disabled = true;
  document.getElementById('btn-waitlist-vip').disabled  = true;

  const user     = auth.currentUser;
  const userDoc  = await db.collection('users').doc(user.uid).get();
  const userData = userDoc.data();
  try {
    await db.collection('waitlist').doc(user.uid).set({
      name:      userData?.name  || '',
      email:     userData?.email || user.email || '',
      type,
      consent:   true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('modal-btns').classList.add('hidden');
    document.getElementById('modal-success').classList.remove('hidden');
  } catch (e) {
    showToast('Eroare la înregistrare. Încearcă din nou.', 'error');
  }
}

document.getElementById('btn-waitlist-free').addEventListener('click', () => saveWaitlist('free'));
document.getElementById('btn-waitlist-vip').addEventListener('click',  () => saveWaitlist('vip'));

// ════════════════════════════════════════════
// SERVICE WORKER — activare PWA
// ════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(err => console.error('SW registration failed:', err));
  });
}
