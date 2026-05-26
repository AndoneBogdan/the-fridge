// ════════════════════════════════════════════
// THE FRIDGE — Ghid alimente
// ════════════════════════════════════════════

function buildGuideUI() {
  const body = document.getElementById('guide-body');
  body.innerHTML = `

    <div class="guide-intro">
      <p>Timpii indicați sunt orientativi. Verificați întotdeauna aspectul, mirosul și textura alimentelor.</p>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">🥩 Carne crudă — Frigider</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Pui (întreg sau bucăți)</span><span class="guide-days">1–2 zile</span></div>
        <div class="guide-row"><span class="guide-food">Carne tocată (orice tip)</span><span class="guide-days">1–2 zile</span></div>
        <div class="guide-row"><span class="guide-food">Porc (cotlet, mușchi)</span><span class="guide-days">3–5 zile</span></div>
        <div class="guide-row"><span class="guide-food">Vită (friptură, bucăți)</span><span class="guide-days">3–5 zile</span></div>
        <div class="guide-row"><span class="guide-food">Pește proaspăt</span><span class="guide-days">1–2 zile</span></div>
        <div class="guide-row"><span class="guide-food">Fructe de mare</span><span class="guide-days">1–2 zile</span></div>
        <div class="guide-row"><span class="guide-food">Ovine (miel, oaie)</span><span class="guide-days">3–5 zile</span></div>
      </div>
      <div class="guide-note">⚠️ Carnea decongelată: consumați în aceeași zi, nu recongelați</div>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">🌭 Mezeluri și preparate</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Cârnați / Salam (nedeschis)</span><span class="guide-days">conform etichetă</span></div>
        <div class="guide-row"><span class="guide-food">Cârnați / Salam (deschis)</span><span class="guide-days">3–5 zile</span></div>
        <div class="guide-row"><span class="guide-food">Șuncă / Prosciutto (deschis)</span><span class="guide-days">3–5 zile</span></div>
        <div class="guide-row"><span class="guide-food">Pate (deschis)</span><span class="guide-days">3–4 zile</span></div>
        <div class="guide-row"><span class="guide-food">Hot-dog (deschis)</span><span class="guide-days">7 zile</span></div>
      </div>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">🥛 Lactate</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Lapte (deschis)</span><span class="guide-days">5–7 zile</span></div>
        <div class="guide-row"><span class="guide-food">Iaurt (deschis)</span><span class="guide-days">5–7 zile</span></div>
        <div class="guide-row"><span class="guide-food">Smântână (deschisă)</span><span class="guide-days">7–10 zile</span></div>
        <div class="guide-row"><span class="guide-food">Unt (deschis)</span><span class="guide-days">1–2 săptămâni</span></div>
        <div class="guide-row"><span class="guide-food">Brânză proaspătă / Telemea</span><span class="guide-days">1–2 săptămâni</span></div>
        <div class="guide-row"><span class="guide-food">Brânzeturi tari (cheddar, emmental)</span><span class="guide-days">3–4 săptămâni</span></div>
        <div class="guide-row"><span class="guide-food">Mozzarella (deschisă)</span><span class="guide-days">3–5 zile</span></div>
      </div>
      <div class="guide-note">💡 Brânzeturile tari pot fi consumate și dacă au un mic petic de mucegai — tăiați 2 cm în jur</div>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">🥚 Ouă</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Ouă crude (în coajă)</span><span class="guide-days">3–5 săptămâni</span></div>
        <div class="guide-row"><span class="guide-food">Ouă fierte tari</span><span class="guide-days">1 săptămână</span></div>
        <div class="guide-row"><span class="guide-food">Ouă bătute (crude)</span><span class="guide-days">2–4 zile</span></div>
        <div class="guide-row"><span class="guide-food">Albuș sau gălbenuș separat</span><span class="guide-days">2–4 zile</span></div>
      </div>
      <div class="guide-note">💡 Test prospețime: puneți oul într-un pahar cu apă. Dacă plutește — aruncați-l</div>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">🥦 Legume</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Salată verde / Spanac</span><span class="guide-days">3–5 zile</span></div>
        <div class="guide-row"><span class="guide-food">Broccoli / Conopidă</span><span class="guide-days">5–7 zile</span></div>
        <div class="guide-row"><span class="guide-food">Morcovi / Țelină</span><span class="guide-days">2–3 săptămâni</span></div>
        <div class="guide-row"><span class="guide-food">Ardei gras</span><span class="guide-days">1–2 săptămâni</span></div>
        <div class="guide-row"><span class="guide-food">Roșii (la frigider)</span><span class="guide-days">5–7 zile</span></div>
        <div class="guide-row"><span class="guide-food">Castraveți</span><span class="guide-days">1 săptămână</span></div>
        <div class="guide-row"><span class="guide-food">Ciuperci</span><span class="guide-days">5–7 zile</span></div>
      </div>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">🍎 Fructe</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Căpșuni / Zmeură / Mure</span><span class="guide-days">3–5 zile</span></div>
        <div class="guide-row"><span class="guide-food">Mere / Pere</span><span class="guide-days">1–2 luni</span></div>
        <div class="guide-row"><span class="guide-food">Struguri</span><span class="guide-days">1–2 săptămâni</span></div>
        <div class="guide-row"><span class="guide-food">Citrice (portocale, lămâi)</span><span class="guide-days">2–4 săptămâni</span></div>
        <div class="guide-row"><span class="guide-food">Pepene (tăiat)</span><span class="guide-days">3–5 zile</span></div>
      </div>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">🍲 Mâncare gătită</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Supă / Ciorbă</span><span class="guide-days">3–4 zile</span></div>
        <div class="guide-row"><span class="guide-food">Mâncare gătită (carne + sos)</span><span class="guide-days">3–4 zile</span></div>
        <div class="guide-row"><span class="guide-food">Orez / Paste gătite</span><span class="guide-days">3–5 zile</span></div>
        <div class="guide-row"><span class="guide-food">Pizza (rece)</span><span class="guide-days">3–4 zile</span></div>
      </div>
      <div class="guide-note">⚠️ Mâncarea gătită trebuie răcită și pusă la frigider în max. 2 ore</div>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">❄️ Congelator — Durata maximă</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Pui întreg / bucăți</span><span class="guide-days">9 luni</span></div>
        <div class="guide-row"><span class="guide-food">Carne tocată</span><span class="guide-days">3–4 luni</span></div>
        <div class="guide-row"><span class="guide-food">Porc / Vită (bucăți mari)</span><span class="guide-days">6–12 luni</span></div>
        <div class="guide-row"><span class="guide-food">Pește</span><span class="guide-days">6 luni</span></div>
        <div class="guide-row"><span class="guide-food">Legume (opărite)</span><span class="guide-days">10–12 luni</span></div>
        <div class="guide-row"><span class="guide-food">Fructe de pădure</span><span class="guide-days">10–12 luni</span></div>
        <div class="guide-row"><span class="guide-food">Pâine / Produse de panificație</span><span class="guide-days">2–3 luni</span></div>
        <div class="guide-row"><span class="guide-food">Mâncare gătită</span><span class="guide-days">2–3 luni</span></div>
      </div>
      <div class="guide-note">💡 Etichetați întotdeauna cu data congelării. Temperatura ideală: -18°C</div>
    </div>

    <div class="guide-section">
      <div class="guide-section-title">🌡️ Temperatura frigiderului</div>
      <div class="guide-table">
        <div class="guide-row"><span class="guide-food">Frigider (ideal)</span><span class="guide-days">1°C – 4°C</span></div>
        <div class="guide-row"><span class="guide-food">Frigider (acceptabil)</span><span class="guide-days">max. 7°C</span></div>
        <div class="guide-row"><span class="guide-food">Congelator</span><span class="guide-days">-18°C sau mai puțin</span></div>
      </div>
      <div class="guide-note">⚠️ Bacteriile se înmulțesc rapid între 4°C și 60°C — "zona de pericol"</div>
    </div>

  `;
}

document.getElementById('btn-back-from-guide').addEventListener('click', () => {
  showScreen('screen-settings');
});
