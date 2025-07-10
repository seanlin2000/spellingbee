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
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const url = `https://www.nytimes.com/${yyyy}/${mm}/${dd}/crosswords/spelling-bee-forum.html`;
      window.open(url, '_blank');
      dropdown.classList.remove('show');
    });
  }

  // Add placeholder listeners for other items
  document.querySelector('.rules-item')?.addEventListener('click', () => {
    alert('Rules popup coming soon!');
    dropdown.classList.remove('show');
  });
  document.querySelector('.rankings-item')?.addEventListener('click', () => {
    alert('Rankings popup coming soon!');
    dropdown.classList.remove('show');
  });
  document.querySelector('.stats-item')?.addEventListener('click', () => {
    alert('Stats popup coming soon!');
    dropdown.classList.remove('show');
  });
}

