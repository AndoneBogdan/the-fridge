// ════════════════════════════════════════════
// THE FRIDGE — Members Screen
// ════════════════════════════════════════════

async function loadMembers() {
  const { householdId, household, role } = appState;
  const body = document.getElementById('members-body');
  body.innerHTML = '<p class="members-loading">Se încarcă...</p>';

  try {
    const snap = await db.collection('households').doc(householdId)
      .collection('members').get();

    const members = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        if (a.role === 'lord_commander') return -1;
        if (b.role === 'lord_commander') return 1;
        return (a.name || '').localeCompare(b.name || '', 'ro');
      });

    let html = '';

    // Cod invitație — doar pentru Lord Commander
    if (role === 'lord_commander') {
      html += `
        <div class="invite-section">
          <div class="section-label">Cod invitație</div>
          <div class="invite-code-display">${household?.inviteCode || '——'}</div>
          <p class="invite-hint">Trimite codul Night Snaker-ilor care vor să se alăture</p>
          <button class="btn btn-ghost btn-sm btn-copy-invite-js">📋 Copiază codul</button>
        </div>
      `;
    }

    // Listă membri
    html += `<div class="members-list">`;
    html += `<div class="section-label" style="padding:0 0 12px 0">Membri (${members.length} / 6)</div>`;

    members.forEach(m => {
      const initial  = (m.name || '?')[0].toUpperCase();
      const isLC     = m.role === 'lord_commander';
      const badge    = isLC ? '⚔️ Lord Commander' : '🌙 Night Snaker';
      const badgeCls = isLC ? 'role-lc' : 'role-ns';
      const isMe     = m.id === appState.user?.uid;

      html += `
        <div class="member-card ${isMe ? 'member-card--me' : ''}">
          <div class="member-avatar" style="background:${m.avatarColor || '#1D9E75'}">${initial}</div>
          <div class="member-info">
            <div class="member-name">${m.name || 'Anonim'}${isMe ? ' <span class="me-tag">tu</span>' : ''}</div>
            <div class="member-role ${badgeCls}">${badge}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    body.innerHTML = html;

    // Buton copiere cod invitație
    body.querySelector('.btn-copy-invite-js')?.addEventListener('click', async () => {
      const code = household?.inviteCode;
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        showToast('Cod copiat! ✓', 'success');
      } catch {
        showToast(`Cod: ${code} — copiază manual`, 'info', 5000);
      }
    });

  } catch (err) {
    console.error('loadMembers error:', err);
    body.innerHTML = '<p style="padding:24px;color:var(--text-2)">Eroare la încărcare.</p>';
  }
}

// ── Event listeners ──
document.getElementById('nav-members').addEventListener('click', () => {
  showScreen('screen-members');
  loadMembers();
});

document.getElementById('btn-back-from-members').addEventListener('click', () => {
  showScreen('screen-dashboard');
});
