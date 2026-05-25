// ════════════════════════════════════════════
// THE FRIDGE — Super Admin Panel
// Accesibil doar pentru UID-ul SUPER_ADMIN_UID
// ════════════════════════════════════════════

async function loadAdminPanel() {
  const body = document.getElementById('admin-body');
  body.innerHTML = '<p class="members-loading">Se încarcă...</p>';

  try {
    const [householdsSnap, usersSnap] = await Promise.all([
      db.collection('households').get(),
      db.collection('users').get()
    ]);

    let totalProducts = 0;
    const list = [];

    for (const hDoc of householdsSnap.docs) {
      const h = hDoc.data();
      const [membersSnap, productsSnap] = await Promise.all([
        db.collection('households').doc(hDoc.id).collection('members').get(),
        db.collection('households').doc(hDoc.id).collection('products').get()
      ]);
      totalProducts += productsSnap.size;

      const ownerDoc = usersSnap.docs.find(d => d.id === h.ownerId);
      const ownerName = ownerDoc ? ownerDoc.data().name : '?';

      list.push({
        id:          hDoc.id,
        name:        h.name,
        owner:       ownerName,
        inviteCode:  h.inviteCode,
        memberCount: membersSnap.size,
        productCount:productsSnap.size,
        createdAt:   h.createdAt,
        memberIds:   membersSnap.docs.map(d => d.id)
      });
    }

    list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

    const waitlistSnap = await db.collection('waitlist').get();
    const waitlistFree = waitlistSnap.docs.filter(d => d.data().type === 'free').length;
    const waitlistVip  = waitlistSnap.docs.filter(d => d.data().type === 'vip').length;

    let html = `
      <div class="admin-stats">
        <div class="admin-stat-card">
          <div class="admin-stat-value">${householdsSnap.size}<span class="admin-stat-cap">/30</span></div>
          <div class="admin-stat-label">Frigidere</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value">${usersSnap.size}</div>
          <div class="admin-stat-label">Utilizatori</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value">${totalProducts}</div>
          <div class="admin-stat-label">Produse</div>
        </div>
      </div>

      <div class="admin-waitlist-row">
        <div class="admin-stat-card">
          <div class="admin-stat-value">${waitlistSnap.size}</div>
          <div class="admin-stat-label">Pe listă așteptare</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-value">${waitlistFree}</div>
          <div class="admin-stat-label">Gratuit</div>
        </div>
        <div class="admin-stat-card admin-stat-card--vip">
          <div class="admin-stat-value">${waitlistVip}</div>
          <div class="admin-stat-label">⭐ Fondatori</div>
        </div>
      </div>

      <a class="admin-analytics-btn" href="https://analytics.google.com" target="_blank">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Deschide Google Analytics
      </a>

      <div class="section-label" style="padding:16px 0 8px">Toate frigiderele</div>
    `;

    for (const h of list) {
      html += `
        <div class="admin-hh-card">
          <div class="admin-hh-top">
            <div class="admin-hh-name">${h.name}</div>
            <div class="admin-hh-badge">${h.inviteCode}</div>
          </div>
          <div class="admin-hh-meta">
            <span>👑 ${h.owner}</span>
            <span>👥 ${h.memberCount}</span>
            <span>📦 ${h.productCount}</span>
          </div>
          <button class="btn btn-danger btn-xs admin-btn-del"
                  data-id="${h.id}"
                  data-name="${h.name}"
                  data-members='${JSON.stringify(h.memberIds)}'>
            Șterge frigider
          </button>
        </div>
      `;
    }

    body.innerHTML = html;

    body.querySelectorAll('.admin-btn-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id      = btn.dataset.id;
        const name    = btn.dataset.name;
        const members = JSON.parse(btn.dataset.members);

        if (!confirm(`Ștergi frigiderul „${name}"? Ireversibil!`)) return;
        if (!confirm('Confirmare finală — ești absolut sigur?')) return;

        try {
          const [membersSnap, productsSnap] = await Promise.all([
            db.collection('households').doc(id).collection('members').get(),
            db.collection('households').doc(id).collection('products').get()
          ]);

          const batch = db.batch();
          membersSnap.docs.forEach(d => batch.delete(d.ref));
          productsSnap.docs.forEach(d => batch.delete(d.ref));
          batch.delete(db.collection('households').doc(id));
          await batch.commit();

          for (const uid of members) {
            await db.collection('users').doc(uid).update({ householdId: null });
          }

          showToast(`„${name}" șters. ✓`, 'success');
          loadAdminPanel();
        } catch (err) {
          console.error('Admin delete error:', err);
          showToast('Eroare la ștergere.', 'error');
        }
      });
    });

  } catch (err) {
    console.error('Admin load error:', err);
    body.innerHTML = '<p style="padding:24px;color:var(--text-2)">Eroare la încărcare. Verifică regulile Firestore.</p>';
  }
}

document.getElementById('btn-back-from-admin').addEventListener('click', () => {
  showScreen('screen-settings');
});
