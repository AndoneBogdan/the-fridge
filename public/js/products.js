// ════════════════════════════════════════════
// THE FRIDGE — Products
// Adăugare, editare, ștergere, afișare, QR
// ════════════════════════════════════════════

const CATEGORIES = [
  { name: 'Pui',            icon: '🐔' },
  { name: 'Porc',           icon: '🐷' },
  { name: 'Vită',           icon: '🐄' },
  { name: 'Pește',          icon: '🐟' },
  { name: 'Ovine',          icon: '🐑' },
  { name: 'Legume',         icon: '🥦' },
  { name: 'Fructe',         icon: '🍎' },
  { name: 'Lactate',        icon: '🥛' },
  { name: 'Mezeluri',       icon: '🌭' },
  { name: 'Conserve',       icon: '🥫' },
  { name: 'Sosuri',         icon: '🫙' },
  { name: 'Mâncare Gătită', icon: '🍲' }
];

// Sugestii de expirare din ghid (zile)
const EXPIRY_SUGGESTIONS = {
  'Frigider': {
    'Pui':            2,
    'Porc':           2,
    'Vită':           2,
    'Pește':          1,
    'Ovine':          2,
    'Legume':         5,
    'Fructe':         5,
    'Lactate':        7,
    'Mezeluri':       4,
    'Conserve':       3,
    'Sosuri':         7,
    'Mâncare Gătită': 3
  },
  'Congelator': {
    'Pui':            270,
    'Porc':           240,
    'Vită':           240,
    'Pește':          180,
    'Ovine':          210,
    'Legume':         300,
    'Fructe':         300,
    'Lactate':        210,
    'Mezeluri':        45,
    'Conserve':        90,
    'Sosuri':          90,
    'Mâncare Gătită':  90
  }
};

// Stare internă
let productFormState    = { location: 'Frigider', category: 'Pui', isOpen: false, editingId: null, qrCode: null };
let currentProductId    = null;
let currentFilter       = 'all';
let searchQuery         = '';
let productsCache       = [];
let productsUnsubscribe = null;

// ════════════════════════════════════════════
// CATEGORY GRID
// ════════════════════════════════════════════
function buildCategoryGrid() {
  const grid = document.getElementById('category-grid');
  grid.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn         = document.createElement('button');
    btn.type          = 'button';
    btn.className     = 'cat-btn' + (cat.name === productFormState.category ? ' active' : '');
    btn.dataset.value = cat.name;
    btn.innerHTML     = `<span class="cat-icon">${cat.icon}</span><span class="cat-name">${cat.name}</span>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      productFormState.category = cat.name;
      updateExpirySuggestion();
    });
    grid.appendChild(btn);
  });
}

// ════════════════════════════════════════════
// TOGGLE LOCAȚIE
// ════════════════════════════════════════════
document.querySelectorAll('#location-control .segment-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#location-control .segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    productFormState.location = btn.dataset.value;
    document.getElementById('section-frozen-date').style.display =
      productFormState.location === 'Congelator' ? 'flex' : 'none';
    updateExpirySuggestion();
  });
});

// ════════════════════════════════════════════
// TOGGLE DESCHIS / NEDESCHIS
// ════════════════════════════════════════════
document.querySelectorAll('#open-toggle .open-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#open-toggle .open-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    productFormState.isOpen = btn.dataset.value === 'true';
  });
});

// ════════════════════════════════════════════
// SUGESTIE EXPIRARE DIN GHID
// ════════════════════════════════════════════
function updateExpirySuggestion() {
  const hintEl  = document.getElementById('expiry-hint');
  const days    = (EXPIRY_SUGGESTIONS[productFormState.location] || {})[productFormState.category];

  if (!days || !hintEl) return;

  const suggested = new Date();
  suggested.setDate(suggested.getDate() + days);
  const suggestedStr = suggested.toISOString().split('T')[0];
  const formatted    = formatDate(suggestedStr);
  const label        = days === 1 ? '1 zi' : days < 30
    ? `${days} zile`
    : days < 365
      ? `${Math.round(days / 30)} luni`
      : `${Math.round(days / 365)} an${Math.round(days / 365) > 1 ? 'i' : ''}`;

  hintEl.textContent = `Sugestie ghid: ~${label} → ${formatted}`;

  const expiryInput = document.getElementById('product-expiry-date');
  if (!expiryInput.value) {
    expiryInput.value = suggestedStr;
  }
}

// ════════════════════════════════════════════
// DESCHIDE FORMULARUL DE ADĂUGARE
// ════════════════════════════════════════════
function openAddProduct() {
  productFormState = { location: 'Frigider', category: 'Pui', isOpen: false, editingId: null, qrCode: null };

  document.getElementById('form-product').reset();
  document.getElementById('add-product-title').textContent   = 'Produs nou';
  document.getElementById('add-product-error').classList.add('hidden');
  document.getElementById('btn-save-product').disabled       = false;
  document.getElementById('btn-save-product').textContent    = 'Salvează';

  // Reset location
  document.querySelectorAll('#location-control .segment-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.value === 'Frigider'));
  document.getElementById('section-frozen-date').style.display = 'none';

  // Reset open/closed
  document.querySelectorAll('#open-toggle .open-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.value === 'false'));

  buildCategoryGrid();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('product-bought-date').value  = today;
  document.getElementById('product-frozen-date').value  = today;
  document.getElementById('product-alert').value        = '3';
  document.getElementById('product-expiry-date').value  = '';
  updateExpirySuggestion();

  showScreen('screen-add-product');
  document.getElementById('product-name').focus();
}

// ════════════════════════════════════════════
// SALVARE PRODUS
// ════════════════════════════════════════════
document.getElementById('btn-save-product').addEventListener('click', async () => {
  hideError('add-product-error');

  const name       = document.getElementById('product-name').value.trim();
  const expiryDate = document.getElementById('product-expiry-date').value || null;

  if (!name) {
    showError('add-product-error', 'Introdu numele produsului.');
    return;
  }

  const saveBtn         = document.getElementById('btn-save-product');
  saveBtn.disabled      = true;
  saveBtn.textContent   = 'Se salvează...';

  try {
    const user     = auth.currentUser;
    const { householdId, userData } = appState;

    const boughtDate = document.getElementById('product-bought-date').value || null;
    const frozenDate = document.getElementById('product-frozen-date').value || null;
    const qty        = document.getElementById('product-qty').value.trim()  || null;
    const notes      = document.getElementById('product-notes').value.trim()|| null;
    const alertDays  = parseInt(document.getElementById('product-alert').value) || 3;
    const isEditing  = !!productFormState.editingId;
    const productCode = isEditing ? (productFormState.qrCode || productFormState.editingId) : generateProductCode();

    const productData = {
      qrCode:           productCode,
      name:             name,
      category:         productFormState.category,
      location:         productFormState.location,
      boughtDate:       boughtDate,
      frozenDate:       productFormState.location === 'Congelator' ? frozenDate : null,
      expiryDate:       expiryDate,
      calculatedExpiry: expiryDate,
      isOpen:           productFormState.isOpen,
      quantity:         qty,
      notes:            notes,
      alertDays:        alertDays,
      createdBy:        user.uid,
      createdByName:    userData?.name || user.displayName || 'Unknown',
      updatedAt:        firebase.firestore.FieldValue.serverTimestamp()
    };

    let docId;

    if (isEditing) {
      await db.collection('households').doc(householdId)
        .collection('products').doc(productFormState.editingId).update(productData);
      docId = productFormState.editingId;
      showToast('Produs actualizat! ✓', 'success');
    } else {
      productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const ref = await db.collection('households').doc(householdId)
        .collection('products').add(productData);
      docId = ref.id;
      showToast('Produs adăugat! ✓', 'success');
    }

    await openProductDetail(docId);

  } catch (err) {
    console.error('Save product error:', err);
    saveBtn.disabled    = false;
    saveBtn.textContent = 'Salvează';
    showError('add-product-error', 'Eroare la salvare. Încearcă din nou.');
  }
});

// ════════════════════════════════════════════
// GENERARE COD PRODUS (TF-XXXXXX)
// ════════════════════════════════════════════
function generateProductCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ════════════════════════════════════════════
// DESCHIDE DETALII PRODUS
// ════════════════════════════════════════════
async function openProductDetail(docId) {
  const { householdId } = appState;

  try {
    const doc = await db.collection('households').doc(householdId)
      .collection('products').doc(docId).get();

    if (!doc.exists) {
      showToast('Produsul nu mai există.', 'error');
      showScreen('screen-dashboard');
      return;
    }

    currentProductId = docId;
    const p = doc.data();

    document.getElementById('detail-product-name').textContent  = p.name;
    document.getElementById('product-code-display').textContent = p.qrCode || '——';

    renderProductDetail(p);

    showScreen('screen-product-detail');

  } catch (err) {
    console.error('openProductDetail error:', err);
    showToast('Eroare la deschidere.', 'error');
  }
}

// ════════════════════════════════════════════
// RENDER DETALII
// ════════════════════════════════════════════
function renderProductDetail(p) {
  const expiry  = p.calculatedExpiry || p.expiryDate;
  const status  = getExpiryStatus(expiry, p.alertDays);
  const catIcon = CATEGORIES.find(c => c.name === p.category)?.icon || '📦';

  let statusBanner = '';
  if (status.isExpired) {
    statusBanner = `
      <div class="status-banner status-banner--expired">
        <span class="expired-label">Expirat</span>
        <span class="white-walkers">White Walkers</span>
      </div>`;
  } else if (status.isExpiringSoon) {
    statusBanner = `
      <div class="status-banner status-banner--warning">
        <em>❄️ Winter is Coming. Your Watch Begins.</em>
      </div>`;
  }

  document.getElementById('detail-info').innerHTML = `
    ${statusBanner}
    <div class="detail-grid">
      <div class="detail-row">
        <span class="detail-label">Categorie</span>
        <span class="detail-value">${catIcon} ${p.category}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Locație</span>
        <span class="detail-value">${p.location === 'Frigider' ? '🧊' : '❄️'} ${p.location}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Stare</span>
        <span class="detail-value">${p.isOpen ? '📂 Deschis' : '📦 Nedeschis'}</span>
      </div>
      ${p.quantity ? `<div class="detail-row"><span class="detail-label">Cantitate</span><span class="detail-value">${p.quantity}</span></div>` : ''}
      ${p.boughtDate ? `<div class="detail-row"><span class="detail-label">Cumpărat</span><span class="detail-value">${formatDate(p.boughtDate)}</span></div>` : ''}
      ${p.frozenDate ? `<div class="detail-row"><span class="detail-label">Congelat</span><span class="detail-value">${formatDate(p.frozenDate)}</span></div>` : ''}
      <div class="detail-row">
        <span class="detail-label">Expiră</span>
        <span class="detail-value detail-expiry-val ${status.class}">${formatDate(expiry)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Alertă</span>
        <span class="detail-value">cu ${p.alertDays || 3} zile înainte</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Adăugat de</span>
        <span class="detail-value">${p.createdByName || '—'}</span>
      </div>
      ${p.notes ? `<div class="detail-row"><span class="detail-label">Note</span><p class="detail-notes">${p.notes}</p></div>` : ''}
    </div>
  `;
}

// ════════════════════════════════════════════
// GENERARE QR CODE
// ════════════════════════════════════════════
function generateQRCode(productCode) {
  const container = document.getElementById('qr-code-container');
  container.innerHTML = '';

  if (typeof QRCode === 'undefined') {
    container.innerHTML = '<p style="color:#888;font-size:0.8rem;padding:20px;text-align:center">QR indisponibil</p>';
    return;
  }

  const base      = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  const qrContent = `${base}/?product=${productCode}`;

  try {
    new QRCode(container, {
      text:         qrContent,
      width:        200,
      height:       200,
      colorDark:    '#000000',
      colorLight:   '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {
    container.innerHTML = '<p style="color:#888;font-size:0.8rem;padding:20px;text-align:center">Eroare QR</p>';
  }
}

// ════════════════════════════════════════════
// ÎNCĂRCARE PRODUSE (real-time Firestore)
// ════════════════════════════════════════════
function loadProducts() {
  if (!appState.householdId) return;

  if (productsUnsubscribe) {
    productsUnsubscribe();
    productsUnsubscribe = null;
  }

  const ref = db.collection('households')
    .doc(appState.householdId)
    .collection('products');

  productsUnsubscribe = ref.onSnapshot(snapshot => {
    productsCache = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const da = a.calculatedExpiry || a.expiryDate || '9999';
        const db2 = b.calculatedExpiry || b.expiryDate || '9999';
        return da.localeCompare(db2);
      });
    renderProducts(currentFilter);
  }, err => {
    console.error('Products listener error:', err);
  });
}

// ════════════════════════════════════════════
// AFIȘARE PRODUSE ÎN DASHBOARD
// ════════════════════════════════════════════
function renderProducts(filter = 'all') {
  currentFilter    = filter;
  const list       = document.getElementById('products-list');
  const emptyState = document.getElementById('empty-state');

  list.querySelectorAll('.product-card').forEach(c => c.remove());

  let products = [...productsCache];
  const today  = new Date().toISOString().split('T')[0];

  switch (filter) {
    case 'fridge':
      products = products.filter(p => p.location === 'Frigider'); break;
    case 'freezer':
      products = products.filter(p => p.location === 'Congelator'); break;
    case 'mine':
      products = products.filter(p => p.createdBy === auth.currentUser?.uid); break;
    case 'expiring': {
      const soon = new Date();
      soon.setDate(soon.getDate() + 7);
      const soonStr = soon.toISOString().split('T')[0];
      products = products.filter(p => {
        const exp = p.calculatedExpiry || p.expiryDate;
        return exp && exp >= today && exp <= soonStr;
      });
      break;
    }
    case 'expired': {
      products = products.filter(p => {
        const exp = p.calculatedExpiry || p.expiryDate;
        return exp && exp < today;
      });
      break;
    }
  }

  if (searchQuery) {
    products = products.filter(p =>
      p.name?.toLowerCase().includes(searchQuery) ||
      String(p.qrCode || '').includes(searchQuery)
    );
  }

  if (products.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';
  const fragment = document.createDocumentFragment();
  products.forEach(p => fragment.appendChild(createProductCard(p)));
  list.appendChild(fragment);
}

// ════════════════════════════════════════════
// CARD PRODUS
// ════════════════════════════════════════════
function createProductCard(product) {
  const expiry  = product.calculatedExpiry || product.expiryDate;
  const status  = getExpiryStatus(expiry, product.alertDays || 3);
  const catIcon = CATEGORIES.find(c => c.name === product.category)?.icon || '📦';

  const card     = document.createElement('div');
  card.className = `product-card ${status.cardClass}`;
  card.dataset.id = product.id;

  let expiryHtml;
  if (status.isExpired) {
    expiryHtml = `
      <div class="product-expiry">
        <span class="expired-label">Expirat</span>
        <span class="white-walkers">White Walkers</span>
      </div>`;
  } else {
    expiryHtml = `
      <div class="product-expiry">
        <span class="expiry-label">Expiră</span>
        <span class="expiry-date ${status.class}">${formatDate(expiry)}</span>
      </div>`;
  }

  card.innerHTML = `
    <div class="product-icon">${catIcon}</div>
    <div class="product-info">
      <div class="product-name">${product.name}</div>
      <div class="product-meta">
        <span>${product.location === 'Frigider' ? '🧊' : '❄️'} ${product.location}</span>
        ${product.isOpen ? '<span>📂 Deschis</span>' : ''}
        ${product.quantity ? `<span>${product.quantity}</span>` : ''}
      </div>
    </div>
    ${expiryHtml}
  `;

  card.addEventListener('click', () => openProductDetail(product.id));
  return card;
}

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════
function getExpiryStatus(expiryDateStr, alertDays = 3) {
  if (!expiryDateStr) return { class: '', cardClass: '', isExpired: false, isExpiringSoon: false };

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const expiry   = new Date(expiryDateStr + 'T00:00:00');
  const diffDays = Math.floor((expiry - today) / 86400000);

  if (diffDays < 0)          return { class: 'expired', cardClass: 'status-expired', isExpired: true,  isExpiringSoon: false };
  if (diffDays <= alertDays) return { class: 'warning', cardClass: 'status-warning', isExpired: false, isExpiringSoon: true  };
  return                            { class: '',        cardClass: '',               isExpired: false, isExpiringSoon: false };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

// ════════════════════════════════════════════
// EDITARE PRODUS
// ════════════════════════════════════════════
document.getElementById('btn-edit-product').addEventListener('click', async () => {
  if (!currentProductId) return;

  try {
    const doc = await db.collection('households').doc(appState.householdId)
      .collection('products').doc(currentProductId).get();
    if (!doc.exists) return;

    const p = doc.data();

    productFormState = {
      location:  p.location  || 'Frigider',
      category:  p.category  || 'Pui',
      isOpen:    !!p.isOpen,
      editingId: currentProductId,
      qrCode:    p.qrCode    || null
    };

    document.getElementById('form-product').reset();
    document.getElementById('add-product-title').textContent   = 'Editează produs';
    document.getElementById('add-product-error').classList.add('hidden');
    document.getElementById('btn-save-product').disabled       = false;
    document.getElementById('btn-save-product').textContent    = 'Salvează';

    document.getElementById('product-name').value        = p.name       || '';
    document.getElementById('product-bought-date').value = p.boughtDate || '';
    document.getElementById('product-frozen-date').value = p.frozenDate || '';
    document.getElementById('product-expiry-date').value = p.expiryDate || '';
    document.getElementById('product-qty').value         = p.quantity   || '';
    document.getElementById('product-notes').value       = p.notes      || '';
    document.getElementById('product-alert').value       = p.alertDays  || 3;

    document.querySelectorAll('#location-control .segment-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.value === p.location));
    document.getElementById('section-frozen-date').style.display =
      p.location === 'Congelator' ? 'flex' : 'none';

    document.querySelectorAll('#open-toggle .open-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.value === String(!!p.isOpen)));

    buildCategoryGrid();
    updateExpirySuggestion();

    showScreen('screen-add-product');

  } catch (err) {
    console.error('Edit error:', err);
  }
});

// ════════════════════════════════════════════
// ȘTERGERE PRODUS
// ════════════════════════════════════════════
document.getElementById('btn-delete-product').addEventListener('click', async () => {
  if (!currentProductId) return;
  if (!confirm('Ești sigur că vrei să ștergi acest produs?')) return;

  try {
    await db.collection('households').doc(appState.householdId)
      .collection('products').doc(currentProductId).delete();
    showToast('Produs șters.', 'info');
    showScreen('screen-dashboard');
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Eroare la ștergere.', 'error');
  }
});

// ════════════════════════════════════════════
// PRINTARE QR
// ════════════════════════════════════════════
document.getElementById('btn-copy-code').addEventListener('click', async () => {
  const code = document.getElementById('product-code-display').textContent;
  try {
    await navigator.clipboard.writeText(code);
    showToast('Cod copiat! ✓', 'success');
  } catch {
    showToast(`Cod: ${code} — copiază manual`, 'info', 5000);
  }
});

// ════════════════════════════════════════════
// NAVIGARE BUTOANE + / ÎNAPOI
// ════════════════════════════════════════════
// ════════════════════════════════════════════
// EXPORT EXCEL
// ════════════════════════════════════════════
function exportExcel() {
  const { householdId, household } = appState;
  if (!householdId) return;

  db.collection('households').doc(householdId)
    .collection('products').get()
    .then(snap => {
      if (snap.empty) { showToast('Nu există produse de exportat.', 'info'); return; }

      const rows = [['Nume', 'Categorie', 'Locație', 'Cantitate', 'Data expirare', 'Cod', 'Adăugat de']];
      snap.docs.forEach(doc => {
        const p = doc.data();
        rows.push([
          p.name        || '',
          p.category    || '',
          p.location    || '',
          p.quantity    || '',
          p.expiryDate  || '',
          p.qrCode      || '',
          p.createdByName || ''
        ]);
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Lățime coloane
      ws['!cols'] = [
        { wch: 25 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 18 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Produse');

      const fileName = `${household?.name || 'Frigider'}_${new Date().toISOString().slice(0,10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Export Excel descărcat! ✓', 'success');
    })
    .catch(() => showToast('Eroare la export.', 'error'));
}

document.getElementById('btn-export-csv').addEventListener('click', exportExcel);

document.getElementById('nav-home').addEventListener('click', showDashboard);
document.getElementById('nav-add').addEventListener('click', openAddProduct);
document.getElementById('btn-top-add').addEventListener('click', openAddProduct);
document.getElementById('btn-cancel-product').addEventListener('click', () => showScreen('screen-dashboard'));
document.getElementById('btn-close-detail').addEventListener('click', () => showScreen('screen-dashboard'));

// ════════════════════════════════════════════
// FILTER TABS
// ════════════════════════════════════════════
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderProducts(tab.dataset.filter);
  });
});

document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  renderProducts(currentFilter);
});

// Pull-to-refresh
let _ptStartY = 0;
const _dashScreen = document.getElementById('screen-dashboard');
_dashScreen.addEventListener('touchstart', (e) => {
  const list = document.getElementById('products-list');
  _ptStartY = list.scrollTop === 0 ? e.touches[0].clientY : 0;
}, { passive: true });
_dashScreen.addEventListener('touchend', (e) => {
  if (!_ptStartY) return;
  if (e.changedTouches[0].clientY - _ptStartY > 70) {
    loadProducts();
    showToast('Actualizat ✓', 'success', 1500);
  }
  _ptStartY = 0;
}, { passive: true });
