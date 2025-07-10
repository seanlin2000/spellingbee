// Game logic for Spelling Bee
import { positionHexagons, fetchBeeLetters, renderHoneycomb, addHoneycombClickListener } from "./honeycomb.js";
import { submitWord, deleteChar, handleShuffleClick } from "./button.js";
import {
  setHeaderDate, setupHamburgerMenu
} from "./header.js";

let currentWord = '';
let beeData = null; // Store the current bee letters
const currentWordDiv = document.querySelector('.current-word');
const hiddenInput = document.querySelector('.word-input');
const deleteBtn = document.querySelector('.delete-btn');
const submitBtn = document.querySelector('.submit-btn');
const shuffleBtn = document.querySelector('.shuffle-btn');
const honeycomb = document.querySelector('.honeycomb');

function updateCurrentWordDisplay() {
  // Get all valid letters from honeycomb (center + outer)
  let validLetters = [];
  if (beeDataRef.value) {
    validLetters = [
      beeDataRef.value.center_letter,
      ...beeDataRef.value.outer_letters
    ].map(l => l.toUpperCase());
  }
  // Build HTML with gray for invalid letters
  let html = '';
  for (const ch of currentWord) {
    if (validLetters.length && !validLetters.includes(ch)) {
      html += `<span style="color:#bbb">${ch}</span>`;
    } else {
      html += `<span style="color:#111">${ch}</span>`;
    }
  }
  currentWordDiv.innerHTML = `${html}<span class="blinking-caret"></span>`;
}

// Provide getter/setter for currentWord for modularity
const getCurrentWord = () => currentWord;
const setCurrentWord = (val) => { currentWord = val; };

// Use a wrapper object for beeData so button.js can access latest value
const beeDataRef = { value: null };

window.addEventListener('DOMContentLoaded', () => {
  hiddenInput.focus();

  submitBtn.addEventListener('click', () => {
    submitWord({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput });
  });
  deleteBtn.addEventListener('click', () => {
    deleteChar({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput });
  });
  shuffleBtn.addEventListener('click', () => {
    handleShuffleClick({ beeData: beeDataRef, renderHoneycomb, honeycomb });
  });

  const gameContainer = document.querySelector('.game-container');

  gameContainer.addEventListener('click', () => hiddenInput.focus());

  // Move honeycomb click listener to honeycomb.js
  // addHoneycombClickListener will be called here
  addHoneycombClickListener({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput });
});

hiddenInput.addEventListener('input', e => {
  setCurrentWord(hiddenInput.value.toUpperCase());
  updateCurrentWordDisplay();
});

hiddenInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    submitWord({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput });
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

// Call these on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  setHeaderDate();
  setupHamburgerMenu();
});

// Expose beeDataRef globally for header.js popup access
window.beeDataRef = beeDataRef;
