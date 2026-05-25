// ════════════════════════════════════════════
// THE FRIDGE — Scan / Căutare după cod
// ════════════════════════════════════════════

function openScanScreen() {
  document.getElementById('scan-code-input').value = '';
  document.getElementById('scan-error').classList.add('hidden');
  showScreen('screen-scan');
  setTimeout(() => document.getElementById('scan-code-input').focus(), 150);
}

async function searchByCode() {
  const raw  = document.getElementById('scan-code-input').value.trim();
  const code = raw.toUpperCase();

  if (!code) {
    showError('scan-error', 'Introdu un cod.');
    return;
  }

  const btn = document.getElementById('btn-scan-search');
  btn.disabled    = true;
  btn.textContent = 'Se caută...';
  hideError('scan-error');

  try {
    const { householdId } = appState;
    if (!householdId) throw new Error('no-household');

    const snap = await db
      .collection('households').doc(householdId)
      .collection('products')
      .where('qrCode', '==', code)
      .limit(1)
      .get();

    if (snap.empty) {
      showError('scan-error', `Niciun produs cu codul „${code}". Verifică dacă l-ai scris corect.`);
      return;
    }

    await openProductDetail(snap.docs[0].id);

  } catch (err) {
    console.error('Scan search error:', err);
    showError('scan-error', 'Eroare la căutare. Încearcă din nou.');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Caută produs';
  }
}

// ── Event listeners ──
document.getElementById('nav-scan').addEventListener('click', openScanScreen);
document.getElementById('btn-back-from-scan').addEventListener('click', () => showScreen('screen-dashboard'));

document.getElementById('btn-scan-search').addEventListener('click', searchByCode);

document.getElementById('scan-code-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchByCode();
});
