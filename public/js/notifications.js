// ════════════════════════════════════════════
// THE FRIDGE — Notificări locale (fără server)
// Verifică produsele la deschiderea aplicației
// ════════════════════════════════════════════

// Apelat la fiecare showDashboard()
async function initNotifications() {
  if (Notification.permission === 'granted') {
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

    new Notification('🧊 The Fridge — Atenție!', {
      body: parts.join('. '),
      icon: '/icons/icon-192.png',
      tag:  'fridge-expiry'
    });
  } catch (err) {
    console.error('Expiry check error:', err);
  }
}

function _refreshNotifButton() {
  const btn = document.getElementById('btn-enable-notifs');
  if (!btn) return;
  const active = typeof Notification !== 'undefined' && Notification.permission === 'granted';
  btn.textContent = active ? 'Active ✓' : 'Activează';
  btn.disabled    = active;
}
