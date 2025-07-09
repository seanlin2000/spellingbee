// Handles navbar-related logic: date, hints link, rules popup, rankings popup, and popup animation

// Set today's date in the header
export function setHeaderDate() {
  const dateElem = document.querySelector('.logo-date');
  if (dateElem) {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateElem.textContent = today.toLocaleDateString(undefined, options);
  }
}

// Dynamically update Hints link with today's date
export function updateHintsLink() {
  const hintsLink = document.querySelector('.topnav a[href*="nytimes.com"]');
  if (hintsLink) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    hintsLink.href = `https://www.nytimes.com/${yyyy}/${mm}/${dd}/crosswords/spelling-bee-forum.html`;
    hintsLink.target = '_blank';
    hintsLink.rel = 'noopener noreferrer';
  }
}

// Shared popup function
export function showPopup({ title, contentHTML }) {
  // ...existing code for showPopup...
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.35)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 10000;

  const popup = document.createElement('div');
  popup.style.background = '#fff';
  popup.style.borderRadius = '18px';
  popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  popup.style.padding = '2rem 1.5rem 1.5rem 1.5rem';
  popup.style.maxWidth = '95vw';
  popup.style.width = '400px';
  popup.style.fontFamily = 'Montserrat, Arial, sans-serif';
  popup.style.color = '#333';
  popup.style.position = 'relative';
  popup.style.textAlign = 'left';
  popup.style.animation = 'popupIn 0.2s cubic-bezier(.4,2,.6,1)';

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '14px';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '1.5rem';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#bfa100';
  closeBtn.style.lineHeight = '1';
  closeBtn.addEventListener('click', function() {
    if (overlay.parentNode) document.body.removeChild(overlay);
  });

  const content = document.createElement('div');
  content.innerHTML = `
    <h2 style="margin-top:0;color:#bfa100;font-size:1.3rem;">${title}</h2>
    ${contentHTML}
  `;

  popup.appendChild(closeBtn);
  popup.appendChild(content);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      if (overlay.parentNode) document.body.removeChild(overlay);
    }
  });
}

// Rules popup
export function setupRulesPopup() {
  const rulesLink = document.querySelector('.topnav a[href="Rules"]');
  if (rulesLink) {
    rulesLink.addEventListener('click', function(e) {
      e.preventDefault();
      showRulesPopup();
    });
  }
}

export function showRulesPopup() {
  showPopup({
    title: 'How to Play Spelling Bee',
    contentHTML: `
      <p style="margin-bottom:0.7em;">Create words using letters from the hive.</p>
      <ul style="margin-top:0.2em;margin-bottom:1em;padding-left:1.2em;list-style:disc;;font-weight:400;">
        <li>Words must contain at least 4 letters.</li>
        <li>Words must include the center letter.</li>
        <li>Our word list does not include words that are obscure, hyphenated, or proper nouns.</li>
        <li>No cussing either, sorry.</li>
        <li>Letters can be used more than once.</li>
      </ul>
      <p style="margin-bottom:0.7em;">Score points to increase your rating.</p>
      <ul style="margin-top:0.2em;margin-bottom:1em;padding-left:1.2em;list-style:disc;">
        <li>4-letter words are worth 1 point each.</li>
        <li>Longer words earn 1 point per letter.</li>
        <li>Each puzzle includes at least one “pangram” which uses every letter. These are worth 7 extra points!</li>
      </ul>
      <p style="margin-bottom:0;">New puzzles are released daily at <b>3 a.m. ET</b>.</p>
    `
  });
}

// Rankings popup
export function setupRankingsPopup(beeDataRef) {
  const rankingsLink = document.querySelector('.topnav a[href="#rankings"]');
  if (rankingsLink) {
    rankingsLink.addEventListener('click', function(e) {
      e.preventDefault();
      showRankingsPopup(beeDataRef);
    });
  }
}

export function showRankingsPopup(beeDataRef) {
  const beeData = beeDataRef.value;
  if (!beeData) return;
  const rankingEntries = Object.entries(beeData)
    .filter(([k, v]) => typeof v === 'number');
  rankingEntries.sort((a, b) => a[1] - b[1]);
  showPopup({
    title: 'Rankings',
    contentHTML: `
      <p style="margin-bottom:0.7em;">Ranks are based on a percentage of possible points in a puzzle. The minimum scores to reach each rank for today’s are:</p>
      <ul style="margin-top:0.2em;margin-bottom:1em;padding-left:1.2em;list-style:disc;font-weight:400;">
        ${rankingEntries.map(([rank, score]) => `<li><b>${rank}</b> (${score})</li>`).join('')}
      </ul>
    `
  });
}

// Optional: popup animation
export function injectPopupAnimation() {
  const style = document.createElement('style');
  style.textContent = `@keyframes popupIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;
  document.head.appendChild(style);
}
