export function positionHexagons() {
  const honeycomb = document.querySelector('.honeycomb');
  const hexes = honeycomb.querySelectorAll('.hex');
  const w = honeycomb.offsetWidth;
  const h = honeycomb.offsetHeight;
  // Calculate center
  const cx = w / 2;
  const cy = h / 2;
  // Distance from center to each hex center
  const r = w * 0.26; // radius for hex centers

  // Angles for 6 outer hexes
  const angles = [270, 330, 30, 90, 150, 210];
  // Set center hex
  hexes[0].style.left = (cx - hexes[0].offsetWidth / 2) + 'px';
  hexes[0].style.top = (cy - hexes[0].offsetHeight / 2) + 'px';
  // Set outer hexes
  for (let i = 1; i < 7; i++) {
    const angleRad = angles[i - 1] * Math.PI / 180;
    const x = cx + r * Math.cos(angleRad) - hexes[i].offsetWidth / 2;
    const y = cy + r * Math.sin(angleRad) - hexes[i].offsetHeight / 2;
    hexes[i].style.left = x + 'px';
    hexes[i].style.top = y + 'px';
  }
}

export function renderHoneycomb(center, outers) {
  const honeycomb = document.querySelector('.honeycomb');
  honeycomb.innerHTML = '';
  // Center
  const centerDiv = document.createElement('div');
  centerDiv.className = 'hex center';
  centerDiv.dataset.letter = center;
  const centerSpan = document.createElement('span');
  centerSpan.className = 'hex-letter';
  centerSpan.textContent = center;
  centerDiv.appendChild(centerSpan);
  honeycomb.appendChild(centerDiv);
  // Outer positions: top, top-right, bottom-right, bottom, bottom-left, top-left
  const positions = ['top', 'top-right', 'bottom-right', 'bottom', 'bottom-left', 'top-left'];
  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = 'hex ' + positions[i];
    div.dataset.letter = outers[i] || '';
    const span = document.createElement('span');
    span.className = 'hex-letter';
    span.textContent = outers[i] || '';
    div.appendChild(span);
    honeycomb.appendChild(div);
  }
  positionHexagons();
  // Add touch feedback after hexagons are created
  addHexTouchFeedback();
}

// Set focus/blur on hidden input based on device type
export function setInputFocus(hiddenInput) {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (!isMobile) {
    hiddenInput.focus();
  } else {
    hiddenInput.blur();
  }
}

// Handles clicks on honeycomb hexes to add letters to the current word
export function addHoneycombClickListener({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput }) {
  const honeycomb = document.querySelector('.honeycomb');
  honeycomb.addEventListener('click', e => {
    const hex = e.target.closest('.hex');
    if (hex && hex.dataset.letter) {
      const current = getCurrentWord();
      setCurrentWord(current + hex.dataset.letter);
      hiddenInput.value = getCurrentWord();
      updateCurrentWordDisplay();
      setInputFocus(hiddenInput);
    }
  });
}

// Add touch feedback with a 1ms delay for hexagons
function addHexTouchFeedback() {
  document.querySelectorAll('.hex').forEach(hex => {
    let timeoutId = null;
    const add = () => {
      hex.classList.add('active-touch');
    };
    const remove = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        hex.classList.remove('active-touch');
      }, 1);
    };
    hex.addEventListener('touchstart', add);
    hex.addEventListener('mousedown', add);
    hex.addEventListener('touchend', remove);
    hex.addEventListener('mouseup', remove);
    hex.addEventListener('mouseleave', remove);
    hex.addEventListener('touchcancel', remove);
  });
}

// Export the function so it can be called after hexagons are created
export { addHexTouchFeedback };
