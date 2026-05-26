// ════════════════════════════════════════════
// THE FRIDGE — Notificări locale (fără server)
// Verifică produsele la deschiderea aplicației
// ════════════════════════════════════════════

function notifEnabled() {
  return localStorage.getItem('notif_disabled') !== 'true';
}

async function showNotif(title, options) {
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  } catch (err) {
    console.error('showNotif error:', err);
    try { new Notification(title, options); } catch (_) {}
  }
}

// Apelat la fiecare showDashboard()
async function initNotifications() {
  if (Notification.permission === 'granted' && notifEnabled()) {
    await checkExpiryOnOpen();
  }
}

// Apelat din butonul din Setări
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Browserul tău nu suportă notificări.', 'info');
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      showToast('Notificările nu au fost activate.', 'info');
      return false;
    }
    showToast('Notificări activate! ✓', 'success');
    _refreshNotifButton();
    await checkExpiryOnOpen();
    return true;
  } catch (err) {
    console.error('Permission error:', err);
    return false;
  }
}

// Verifică produsele care expiră și afișează notificare de sistem
async function checkExpiryOnOpen() {
  if (Notification.permission !== 'granted') return;

  const { householdId, household } = appState;
  if (!householdId) return;

  try {
    const alertDays  = household?.alertDays ?? 3;
    const now        = new Date();
    now.setHours(0, 0, 0, 0);

    const snap = await db
      .collection('households').doc(householdId)
      .collection('products').get();

    const expiring = [];
    for (const doc of snap.docs) {
      const p = doc.data();
      if (!p.expiryDate) continue;
      const expiry = new Date(p.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const daysLeft = Math.round((expiry - now) / 86400000);
      if (daysLeft >= 0 && daysLeft <= alertDays) {
        expiring.push({ name: p.name, daysLeft });
      }
    }

    if (!expiring.length) return;

    const today = expiring.filter(p => p.daysLeft === 0);
    const soon  = expiring.filter(p => p.daysLeft > 0);
    const parts = [];
    if (today.length) parts.push(`Expiră AZI: ${today.map(p => p.name).join(', ')}`);
    if (soon.length)  parts.push(`Curând: ${soon.map(p => `${p.name} (${p.daysLeft}z)`).join(', ')}`);

    const todayStr = new Date().toISOString().slice(0, 10);
    await showNotif('🧊 The Fridge — Atenție!', {
      body: parts.join('. '),
      icon: '/icons/icon-192.png',
      tag:  `fridge-expiry-${todayStr}`
    });
  } catch (err) {
    console.error('Expiry check error:', err);
  }
}

function _refreshNotifButton() {
  const granted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
  const chk     = document.getElementById('chk-notifs');
  const btnTest = document.getElementById('btn-test-notifs');
  if (chk)     chk.checked = granted && notifEnabled();
  if (btnTest) btnTest.classList.toggle('hidden', !granted || !notifEnabled());
}
