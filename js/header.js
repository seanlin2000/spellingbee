// Handles navbar-related logic: date, hints link, rules popup, rankings popup, and popup animation

// Set today's date in the header
export function setHeaderDate() {
  const dateElem = document.querySelector('.logo-date');
  if (dateElem) {
    // Get current date in Pacific Time
    const now = new Date();
    // 'America/Los_Angeles' is the IANA name for Pacific Time
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' };
    dateElem.textContent = now.toLocaleDateString(undefined, options);
  }
}

// Hamburger menu logic
export function setupHamburgerMenu() {
  const menuBtn = document.querySelector('.hamburger-menu');
  const dropdown = document.querySelector('.dropdown-menu');
  if (!menuBtn || !dropdown) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });

  // Touch feedback for dropdown items (mobile)
  const items = dropdown.querySelectorAll('.dropdown-item');
  items.forEach(item => {
    item.addEventListener('touchstart', () => {
      item.classList.add('touch-active');
    });
    item.addEventListener('touchend', () => {
      setTimeout(() => item.classList.remove('touch-active'), 150);
    });
    item.addEventListener('touchcancel', () => {
      item.classList.remove('touch-active');
    });
  });

  // Hint button logic
  const hintBtn = document.querySelector('.hint-item');
  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      // Use Pacific Time for the date
      const now = new Date();
      const yyyy = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric' });
      const mm = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', month: '2-digit' });
      const dd = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', day: '2-digit' });
      const url = `https://www.nytimes.com/${yyyy}/${mm}/${dd}/crosswords/spelling-bee-forum.html`;
      window.open(url, '_blank');
      dropdown.classList.remove('show');
    });
  }

  // Add placeholder listeners for other items
  document.querySelector('.rules-item')?.addEventListener('click', () => {
    // Build the rules popup content as a DOM node for better formatting
    showRulesPopup();
    dropdown.classList.remove('show');
  });
  document.querySelector('.rankings-item')?.addEventListener('click', () => {
    // Use beeDataRef from app.js via window
    const rankings = window.beeDataRef?.value;
    if (rankings && rankings.Beginner !== undefined) {
      // Dynamically get ranking keys from beeDataRef and sort by score ascending
      const rankingKeys = Object.keys(rankings)
        .filter(k => typeof rankings[k] === 'number')
        .sort((a, b) => rankings[a] - rankings[b]);
      const scores = {};
      for (const k of rankingKeys) if (rankings[k] !== undefined) scores[k] = rankings[k];
      showRankingsPopup(scores);
    } else {
      alert('Rankings not available yet!');
    }
    dropdown.classList.remove('show');
  });
  document.querySelector('.stats-item')?.addEventListener('click', () => {
    dropdown.classList.remove('show');
  });
  document.querySelector('.answers-item')?.addEventListener('click', () => {
    const yesterdayData = window.yesterdayBeeDataRef?.value;
    if (yesterdayData && Array.isArray(yesterdayData.answers)) {
      showAnswersPopup(yesterdayData);
    }
    dropdown.classList.remove('show');
  });
}

// Shared popup helper
function showPopup({ heading, content, contentType = 'div' }) {
  document.querySelectorAll('.popup-overlay').forEach(e => e.remove());

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.18)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 1000;

  const popup = document.createElement('div');
  popup.className = 'popup-content';
  popup.style.background = '#fff';
  popup.style.borderRadius = '14px';
  popup.style.boxShadow = '0 4px 24px rgba(0,0,0,0.13)';
  popup.style.padding = '2.2rem 2.5rem 2rem 2.5rem';
  popup.style.maxWidth = '90vw';
  popup.style.width = '370px';
  popup.style.fontSize = '1.08rem';
  popup.style.color = '#222';
  popup.style.position = 'relative';
  popup.style.fontFamily = "'Montserrat', 'Segoe UI', 'Arial', 'sans-serif'";

  // Heading
  if (heading) {
    const headingDiv = document.createElement('div');
    headingDiv.textContent = heading;
    headingDiv.style.fontWeight = '700';
    headingDiv.style.fontSize = '1.35rem';
    headingDiv.style.letterSpacing = '0.01em';
    headingDiv.style.marginBottom = '0.7em';
    headingDiv.style.textAlign = 'center';
    headingDiv.style.fontFamily = "'Montserrat', 'Segoe UI', 'Arial', 'sans-serif'";
    popup.appendChild(headingDiv);
  }

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '12px';
  closeBtn.style.right = '18px';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '1.7rem';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#888';
  closeBtn.style.lineHeight = '1';
  closeBtn.addEventListener('click', () => overlay.remove());
  popup.appendChild(closeBtn);

  // Content
  let contentElem;
  if (contentType === 'pre') {
    contentElem = document.createElement('pre');
    contentElem.textContent = content;
    contentElem.style.fontWeight = '400';
    contentElem.style.fontSize = '1.01rem';
    contentElem.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";
    contentElem.style.background = 'none';
    contentElem.style.border = 'none';
    contentElem.style.margin = 0;
    contentElem.style.whiteSpace = 'pre-wrap';
  } else if (contentType === 'node') {
    contentElem = content; // already a DOM node
  } else {
    contentElem = document.createElement('div');
    contentElem.innerHTML = content;
    contentElem.style.fontWeight = '400';
    contentElem.style.fontSize = '1.01rem';
    contentElem.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";
  }
  popup.appendChild(contentElem);

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.remove();
  });
}

function showRulesPopup() {
    const wrapper = document.createElement('div');
      // Section 1: Intro
    const intro = document.createElement('div');
    intro.textContent = 'Create words using letters from the hive.';
    intro.style.marginBottom = '1.1em';
    intro.style.fontWeight = '400';
    intro.style.fontSize = '1.05rem';
    intro.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";
    wrapper.appendChild(intro);

    // Section 2: Word rules (bulleted)
    const wordRules = [
      'Words must contain at least 4 letters.',
      'Words must include the center letter.',
      'Does not include words that are obscure, hyphenated, or proper nouns.',
      'No swear words',
      'Letters can be used more than once.'
    ];
    const wordRulesList = document.createElement('ul');
    wordRulesList.style.margin = '0 0 0 0'; // reduce left indent
    wordRulesList.style.fontWeight = '400';
    wordRulesList.style.fontSize = '1.05rem';
    wordRulesList.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";
    wordRules.forEach(rule => {
      const li = document.createElement('li');
      li.textContent = rule;
      wordRulesList.appendChild(li);
    });
    wrapper.appendChild(wordRulesList);

    // Section 3: Score points intro
    const scoreIntro = document.createElement('div');
    scoreIntro.textContent = 'Score points to increase your rating.';
    scoreIntro.style.margin = '1.2em 0 0.7em 0';
    scoreIntro.style.fontWeight = '400';
    scoreIntro.style.fontSize = '1.05rem';
    scoreIntro.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";
    wrapper.appendChild(scoreIntro);

    // Section 4: Scoring rules (bulleted)
    const scoringRules = [
      '4-letter words are worth 1 point each.',
      'Longer words earn 1 point per letter.',
      'Each puzzle includes at least one “pangram” which uses every letter. These are worth 7 extra points!'
    ];
    const scoringRulesList = document.createElement('ul');
    scoringRulesList.style.margin = '0 0 0 0'; // reduce left indent
    scoringRulesList.style.fontWeight = '400';
    scoringRulesList.style.fontSize = '1.05rem';
    scoringRulesList.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";
    scoringRules.forEach(rule => {
      const li = document.createElement('li');
      li.textContent = rule;
      scoringRulesList.appendChild(li);
    });
    wrapper.appendChild(scoringRulesList);

    // Section 5: New puzzle info
    const newPuzzle = document.createElement('div');
    newPuzzle.textContent = 'New puzzles are released daily at 4 a.m. ET.';
    newPuzzle.style.margin = '1.2em 0 0 0';
    newPuzzle.style.fontWeight = '400';
    newPuzzle.style.fontSize = '1.05rem';
    newPuzzle.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";
    wrapper.appendChild(newPuzzle);

    showPopup({
      heading: 'How to Play FreeBee',
      content: wrapper,
      contentType: 'node'
    });
}

// Refactored Rankings popup
function showRankingsPopup(rankings) {
  // Rankings list as a DOM node
  const intro = document.createElement('div');
  intro.textContent = "Ranks are based on a percentage of possible points in a puzzle. The minimum scores to reach each rank for today’s are:";
  intro.style.marginBottom = '1.2em';
  intro.style.fontWeight = '400';
  intro.style.fontSize = '1.01rem';
  intro.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";

  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.padding = 0;
  list.style.margin = 0;
  for (const [rank, score] of Object.entries(rankings)) {
    const li = document.createElement('li');
    li.innerHTML = `<b>${rank}</b> (<b>${score}</b>)`;
    li.style.marginBottom = '0.4em';
    li.style.fontSize = '1.08rem';
    li.style.letterSpacing = '0.01em';
    li.style.fontFamily = "'Montserrat', 'Segoe UI', 'Arial', 'sans-serif'";
    list.appendChild(li);
  }
  const wrapper = document.createElement('div');
  wrapper.appendChild(intro);
  wrapper.appendChild(list);
  showPopup({ heading: 'Rankings', content: wrapper, contentType: 'node' });
}

function showAnswersPopup(yesterdayData) {
  // Create wrapper for popup
  const wrapper = document.createElement('div');
  // Title sentence
  const subtitle = document.createElement('div');
  subtitle.textContent = "Here are the answers to yesterday's FreeBee";
  subtitle.style.marginBottom = '1.1em';
  subtitle.style.fontWeight = '400';
  subtitle.style.fontSize = '1.05rem';
  subtitle.style.fontFamily = "'Inter', 'Segoe UI', 'Arial', 'sans-serif'";
  wrapper.appendChild(subtitle);
  // Scrollable answers list
  const listContainer = document.createElement('div');
  listContainer.style.maxHeight = '320px';
  listContainer.style.overflowY = 'auto';
  listContainer.style.borderRadius = '8px';
  listContainer.style.background = '#f9f9f9';
  listContainer.style.padding = '0.5em 0.7em';
  listContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
  listContainer.style.marginBottom = '0.5em';
  // Answers as a list
  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.padding = 0;
  ul.style.margin = 0;
  ul.style.fontSize = '1.08rem';
  ul.style.fontFamily = "'Montserrat', 'Segoe UI', 'Arial', 'sans-serif'";
  const pangrams = Array.isArray(yesterdayData.pangrams) ? yesterdayData.pangrams.map(p => p.toLowerCase()) : [];
  yesterdayData.answers.forEach(ans => {
    const li = document.createElement('li');
    li.textContent = ans;
    if (pangrams.includes(ans.toLowerCase())) {
      li.textContent += ' (Pangram)';
      li.style.fontWeight = '700';
      li.style.color = '#FFCE1C';
    }
    li.style.marginBottom = '0.3em';
    ul.appendChild(li);
  });
  listContainer.appendChild(ul);
  wrapper.appendChild(listContainer);
  showPopup({
    heading: "Yesterday's Answers",
    content: wrapper,
    contentType: 'node'
  });
}

