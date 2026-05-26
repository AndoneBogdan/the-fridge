// ════════════════════════════════════════════
// THE FRIDGE — Settings Screen
// ════════════════════════════════════════════

function buildSettingsUI() {
  const { household, role, householdId, user } = appState;
  const isLC = role === 'lord_commander';
  const body = document.getElementById('settings-body');

  body.innerHTML = `

    ${isLC ? `
    <!-- ── FRIGIDER ── -->
    <div class="settings-section">
      <div class="settings-section-title">Frigider</div>

      <!-- Redenumire -->
      <div class="settings-item" id="si-rename">
        <div class="settings-item-main">
          <span class="settings-item-icon">🏠</span>
          <span class="settings-item-label">Redenumește frigiderul</span>
          <svg class="settings-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="settings-form hidden" id="form-rename">
          <input class="form-input" type="text" id="input-fridge-name"
                 value="${household?.name || ''}" placeholder="Numele frigiderului">
          <div id="rename-error" class="error-msg hidden"></div>
          <button class="btn btn-primary btn-sm" id="btn-save-rename">Salvează</button>
        </div>
      </div>

      <!-- Schimbare parolă -->
      <div class="settings-item" id="si-password">
        <div class="settings-item-main">
          <span class="settings-item-icon">🔑</span>
          <span class="settings-item-label">Schimbă parola frigiderului</span>
          <svg class="settings-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="settings-form hidden" id="form-password">
          <input class="form-input" type="password" id="input-new-pwd"
                 placeholder="Parolă nouă (min. 4 caractere)">
          <input class="form-input" type="password" id="input-new-pwd2"
                 placeholder="Confirmă parola nouă">
          <div id="password-error" class="error-msg hidden"></div>
          <button class="btn btn-primary btn-sm" id="btn-save-password">Salvează</button>
        </div>
      </div>

      <!-- Cod invitație -->
      <div class="settings-item settings-item--static">
        <span class="settings-item-icon">📋</span>
        <span class="settings-item-label">Cod invitație</span>
        <span class="settings-invite-code">${household?.inviteCode || '——'}</span>
        <button class="btn btn-ghost btn-xs" id="btn-settings-copy-invite">Copiază</button>
      </div>
    </div>
    ` : ''}

    ${appState.user?.uid === SUPER_ADMIN_UID ? `
    <!-- ── SUPER ADMIN ── -->
    <div class="settings-section">
      <div class="settings-section-title">Super Admin</div>
      <div class="settings-item settings-item--action" id="btn-open-admin">
        <span class="settings-item-icon">⚔️</span>
        <span class="settings-item-label">Panou administrare</span>
        <svg class="settings-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
    ` : ''}

    <!-- ── NOTIFICĂRI ── -->
    <div class="settings-section">
      <div class="settings-section-title">Notificări</div>
      <div class="settings-item settings-item--static">
        <span class="settings-item-icon">🔔</span>
        <span class="settings-item-label">Alerte produse care expiră</span>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <button class="btn btn-ghost btn-xs" id="btn-enable-notifs"
            ${(typeof Notification !== 'undefined' && Notification.permission === 'granted') ? 'disabled' : ''}>
            ${(typeof Notification !== 'undefined' && Notification.permission === 'granted') ? 'Active ✓' : 'Activează'}
          </button>
          <button class="btn btn-ghost btn-xs hidden" id="btn-toggle-notifs"></button>
          <button class="btn btn-ghost btn-xs hidden" id="btn-test-notifs">🔔 Test</button>
        </div>
      </div>
    </div>

    <!-- ── CONT ── -->
    <div class="settings-section">
      <div class="settings-section-title">Cont</div>
      <div class="settings-item settings-item--action" id="btn-logout-item">
        <span class="settings-item-icon">🚪</span>
        <div class="settings-item-text">
          <span class="settings-item-label">Deconectare</span>
          <span class="settings-item-sublabel">Ieși din frigider</span>
        </div>
        <svg class="settings-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>

    <!-- ── ZONA PERICULOASĂ ── -->
    <div class="settings-section settings-section--danger">
      <div class="settings-section-title">Zona periculoasă</div>
      ${isLC
        ? `<div class="settings-item settings-item--danger" id="btn-delete-fridge-item">
             <span class="settings-item-icon">🗑️</span>
             <span class="settings-item-label">Șterge frigiderul</span>
             <svg class="settings-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
           </div>`
        : `<div class="settings-item settings-item--danger" id="btn-leave-fridge-item">
             <span class="settings-item-icon">🏃</span>
             <span class="settings-item-label">Abandonează frigiderul</span>
             <svg class="settings-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
           </div>`
      }
    </div>

    <p class="settings-version">The Fridge v1.0</p>
  `;

  wireSettingsEvents();
}

function wireSettingsEvents() {
  const { household, role, householdId, user } = appState;
  const isLC = role === 'lord_commander';

  // ── Toggle redenumire
  document.getElementById('si-rename')?.querySelector('.settings-item-main')
    .addEventListener('click', () => toggleSettingsForm('form-rename', 'si-rename'));

  // ── Salvare nume
  document.getElementById('btn-save-rename')?.addEventListener('click', async () => {
    const name = document.getElementById('input-fridge-name').value.trim();
    if (!name) { showError('rename-error', 'Introdu un nume.'); return; }
    const btn = document.getElementById('btn-save-rename');
    btn.disabled = true; btn.textContent = 'Se salvează...';
    try {
      await db.collection('households').doc(householdId).update({ name });
      appState.household = { ...appState.household, name };
      document.getElementById('dashboard-fridge-name').textContent = name;
      showToast('Frigider redenumit! ✓', 'success');
      toggleSettingsForm('form-rename', 'si-rename', false);
    } catch (e) {
      showError('rename-error', 'Eroare la salvare.');
    } finally {
      btn.disabled = false; btn.textContent = 'Salvează';
    }
  });

  // ── Toggle parolă
  document.getElementById('si-password')?.querySelector('.settings-item-main')
    .addEventListener('click', () => toggleSettingsForm('form-password', 'si-password'));

  // ── Salvare parolă nouă
  document.getElementById('btn-save-password')?.addEventListener('click', async () => {
    const pwd  = document.getElementById('input-new-pwd').value;
    const pwd2 = document.getElementById('input-new-pwd2').value;
    if (!pwd || pwd.length < 4) { showError('password-error', 'Parola trebuie să aibă minim 4 caractere.'); return; }
    if (pwd !== pwd2)           { showError('password-error', 'Parolele nu coincid.'); return; }
    const btn = document.getElementById('btn-save-password');
    btn.disabled = true; btn.textContent = 'Se salvează...';
    try {
      const hash = await hashPassword(pwd);
      await db.collection('households').doc(householdId).update({ passwordHash: hash });
      showToast('Parolă schimbată! ✓', 'success');
      toggleSettingsForm('form-password', 'si-password', false);
      document.getElementById('input-new-pwd').value  = '';
      document.getElementById('input-new-pwd2').value = '';
    } catch (e) {
      showError('password-error', 'Eroare la salvare.');
    } finally {
      btn.disabled = false; btn.textContent = 'Salvează';
    }
  });

  // ── Admin panel
  document.getElementById('btn-open-admin')?.addEventListener('click', () => {
    loadAdminPanel();
    showScreen('screen-admin');
  });

  // ── Notificări
  document.getElementById('btn-enable-notifs')?.addEventListener('click', () => {
    requestNotificationPermission();
  });

  document.getElementById('btn-toggle-notifs')?.addEventListener('click', () => {
    const disabled = localStorage.getItem('notif_disabled') === 'true';
    localStorage.setItem('notif_disabled', disabled ? 'false' : 'true');
    _refreshNotifButton();
    showToast(disabled ? 'Alerte reactivate ✓' : 'Alerte dezactivate', 'info');
  });

  document.getElementById('btn-test-notifs')?.addEventListener('click', () => {
    new Notification('🧊 The Fridge — Test', {
      body: 'Notificările funcționează corect! ✓',
      icon: '/icons/icon-192.png'
    });
    showToast('Notificare de test trimisă', 'info');
  });

  // ── Copiere cod invitație
  document.getElementById('btn-settings-copy-invite')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(household?.inviteCode || '');
      showToast('Cod copiat! ✓', 'success');
    } catch {
      showToast(`Cod: ${household?.inviteCode} — copiază manual`, 'info', 5000);
    }
  });

  // ── Logout
  document.getElementById('btn-logout-item')?.addEventListener('click', async () => {
    if (!confirm('Ești sigur că vrei să te deconectezi?')) return;
    if (typeof productsUnsubscribe === 'function') productsUnsubscribe();
    await auth.signOut();
    appState = { user: null, userData: null, householdId: null, household: null, role: null };
    showScreen('screen-login');
    showToast('Deconectat. Noapte bună! 🌙', 'info');
  });

  // ── Ștergere frigider (LC)
  document.getElementById('btn-delete-fridge-item')?.addEventListener('click', async () => {
    if (!confirm('Ești SIGUR? Această acțiune șterge frigiderul și TOATE produsele permanent!')) return;
    if (!confirm('Ultima confirmare — chiar vrei să ștergi tot?')) return;
    try {
      const [memberSnap, productSnap] = await Promise.all([
        db.collection('households').doc(householdId).collection('members').get(),
        db.collection('households').doc(householdId).collection('products').get()
      ]);
      const batch = db.batch();
      memberSnap.docs.forEach(d  => batch.delete(d.ref));
      productSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(db.collection('households').doc(householdId));
      await batch.commit();
      await db.collection('users').doc(user.uid).update({ householdId: null });
      appState = { user, userData: appState.userData, householdId: null, household: null, role: null };
      showToast('Frigider șters.', 'info');
      showScreen('screen-choose-path');
    } catch (e) {
      console.error('Delete fridge error:', e);
      showToast('Eroare la ștergere.', 'error');
    }
  });

  // ── Abandonare frigider (NS)
  document.getElementById('btn-leave-fridge-item')?.addEventListener('click', async () => {
    if (!confirm('Ești sigur că vrei să abandonezi frigiderul?')) return;
    try {
      await db.collection('households').doc(householdId)
        .collection('members').doc(user.uid).delete();
      await db.collection('users').doc(user.uid).update({ householdId: null });
      appState = { user, userData: appState.userData, householdId: null, household: null, role: null };
      showToast('Ai abandonat frigiderul.', 'info');
      showScreen('screen-choose-path');
    } catch (e) {
      console.error('Leave fridge error:', e);
      showToast('Eroare. Încearcă din nou.', 'error');
    }
  });
}

function toggleSettingsForm(formId, itemId, forceClose) {
  const form = document.getElementById(formId);
  const item = document.getElementById(itemId);
  if (!form) return;
  const isOpen = !form.classList.contains('hidden');
  if (forceClose === false || isOpen) {
    form.classList.add('hidden');
    item?.classList.remove('si--open');
  } else {
    form.classList.remove('hidden');
    item?.classList.add('si--open');
    form.querySelector('input')?.focus();
  }
}

// ── Event listeners ──
document.getElementById('nav-settings').addEventListener('click', () => {
  buildSettingsUI();
  showScreen('screen-settings');
  _refreshNotifButton();
});

document.getElementById('btn-back-from-settings').addEventListener('click', () => {
  showScreen('screen-dashboard');
});
