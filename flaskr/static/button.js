// Handles button event listeners for submit, delete, and shuffle
export function initButtonHandlers({
  getCurrentWord,
  setCurrentWord,
  updateCurrentWordDisplay,
  hiddenInput,
  beeData,
  renderHoneycomb
}) {
  const deleteBtn = document.querySelector('.delete-btn');
  const submitBtn = document.querySelector('.submit-btn');
  const shuffleBtn = document.querySelector('.shuffle-btn');
  const honeycomb = document.querySelector('.honeycomb');

  function submitWord() {
    const word = getCurrentWord();
    if (word) {
      alert('You entered: ' + word);
      setCurrentWord('');
      hiddenInput.value = '';
      updateCurrentWordDisplay();
    }
  }

  function deleteChar() {
    const word = getCurrentWord();
    if (word) {
      setCurrentWord(word.slice(0, -1));
      hiddenInput.value = getCurrentWord();
      updateCurrentWordDisplay();
      hiddenInput.focus();
    }
  }

  submitBtn.addEventListener('click', submitWord);
  deleteBtn.addEventListener('click', deleteChar);

  // Shuffle button functionality
  shuffleBtn.addEventListener('click', () => {
    if (!beeData.value) return;
    // Fade out only the letters inside each outer hex (not center)
    const hexes = honeycomb.querySelectorAll('.hex:not(.center)');
    hexes.forEach(hex => {
      const letterSpan = hex.querySelector('.hex-letter');
      if (letterSpan) {
        letterSpan.style.transition = 'opacity 0.35s';
        letterSpan.style.opacity = '0';
      }
    });
    setTimeout(() => {
      // Shuffle the outer letters
      const shuffled = [...beeData.value.outer_letters];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      renderHoneycomb(beeData.value.center_letter, shuffled);
      // Fade in new letters (outer hexes only)
      const newHexes = honeycomb.querySelectorAll('.hex:not(.center)');
      newHexes.forEach(hex => {
        const letterSpan = hex.querySelector('.hex-letter');
        if (letterSpan) {
          letterSpan.style.transition = 'opacity 0.35s';
          letterSpan.style.opacity = '0';
          setTimeout(() => {
            letterSpan.style.opacity = '1';
          }, 10);
        }
      });
    }, 350); // 350ms fade out, then fade in
  });
}
