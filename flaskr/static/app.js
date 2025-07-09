// Game logic for Spelling Bee
import { positionHexagons, fetchBeeLetters, renderHoneycomb } from "./honeycomb.js";
import { initButtonHandlers } from "./button.js";

let currentWord = '';
let beeData = null; // Store the current bee letters
const currentWordDiv = document.querySelector('.current-word');
const hiddenInput = document.querySelector('.word-input');

function updateCurrentWordDisplay() {
  currentWordDiv.innerHTML = `${currentWord}<span class="blinking-caret"></span>`;
}

// Provide getter/setter for currentWord for modularity
const getCurrentWord = () => currentWord;
const setCurrentWord = (val) => { currentWord = val; };

// Use a wrapper object for beeData so button.js can access latest value
const beeDataRef = { value: null };

window.addEventListener('DOMContentLoaded', () => {
  hiddenInput.focus();

  // Move button event listeners to button.js
  initButtonHandlers({
    getCurrentWord,
    setCurrentWord,
    updateCurrentWordDisplay,
    hiddenInput,
    beeData: beeDataRef,
    renderHoneycomb
  });

  const gameContainer = document.querySelector('.game-container');
  const honeycomb = document.querySelector('.honeycomb');

  gameContainer.addEventListener('click', () => hiddenInput.focus());

  honeycomb.addEventListener('click', e => {
    const hex = e.target.closest('.hex');
    if (hex && hex.dataset.letter) {
      currentWord += hex.dataset.letter;
      hiddenInput.value = currentWord;
      updateCurrentWordDisplay();
      hiddenInput.focus();
    }
  });
});

hiddenInput.addEventListener('input', e => {
  currentWord = hiddenInput.value.toUpperCase();
  updateCurrentWordDisplay();
});

hiddenInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    // Submit logic now handled by button.js, but keep for keyboard
    const word = getCurrentWord();
    if (word) {
      alert('You entered: ' + word);
      setCurrentWord('');
      hiddenInput.value = '';
      updateCurrentWordDisplay();
    }
    e.preventDefault();
  } else if (e.key.length === 1 && !/^[a-zA-Z]$/.test(e.key)) {
    e.preventDefault();
  }
});

window.addEventListener('resize', positionHexagons);
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await fetchBeeLetters();
    beeData = data;
    beeDataRef.value = data;
    renderHoneycomb(data.center_letter, data.outer_letters);
  } catch (e) {
    beeData = { center_letter: 'A', outer_letters: ['B','C','D','E','F','G'] };
    beeDataRef.value = beeData;
    renderHoneycomb(beeData.center_letter, beeData.outer_letters);
  }
  positionHexagons();
});
