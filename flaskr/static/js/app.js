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
    handleWordSubmission();
    e.preventDefault();
  } else if (e.key.length === 1 && !/^[a-zA-Z]$/.test(e.key)) {
    e.preventDefault();
  }
});

// --- Found Words Logic ---
const foundWordsBox = document.querySelector('.found-words-box');
const foundWordsCount = document.querySelector('.found-words-count');
const foundWordsList = document.querySelector('.found-words-list');
const foundWordsToggle = document.querySelector('.found-words-toggle');
let foundWords = [];

function updateFoundWordsDisplay() {
  if (!foundWordsCount || !foundWordsList) return;
  foundWordsCount.textContent = `You have found ${foundWords.length} word${foundWords.length === 1 ? '' : 's'}`;
  foundWordsList.innerHTML = foundWords.map(w => `<div>${w}</div>`).join('');
}

if (foundWordsToggle) {
  foundWordsToggle.addEventListener('click', () => {
    const expanded = foundWordsList.style.display === 'block';
    foundWordsList.style.display = expanded ? 'none' : 'block';
    foundWordsToggle.innerHTML = expanded ? '&#x25BC;' : '&#x25B2;';
  });
}

// Add feedback bubble below found-words-box
const feedbackBubble = document.createElement('div');
feedbackBubble.className = 'feedback-bubble';
feedbackBubble.style.display = 'none';
feedbackBubble.style.opacity = 0;
feedbackBubble.style.transition = 'opacity 0.15s';
feedbackBubble.style.margin = '0.5em auto 0 auto';
feedbackBubble.style.maxWidth = '210px';
feedbackBubble.style.background = '#fff';
feedbackBubble.style.border = '1.5px solid #E7E7E7';
feedbackBubble.style.borderRadius = '18px';
feedbackBubble.style.padding = '0.6em 1.2em';
feedbackBubble.style.fontFamily = "'Inter', 'Segoe UI', Arial, sans-serif";
feedbackBubble.style.fontSize = '1.08rem';
feedbackBubble.style.color = '#222';
feedbackBubble.style.textAlign = 'center';
feedbackBubble.style.boxShadow = '0 2px 4px rgba(0,0,0,0.07)';
feedbackBubble.style.pointerEvents = 'none';
foundWordsBox?.insertAdjacentElement('afterend', feedbackBubble);

function showFeedbackBubble(msg) {
  feedbackBubble.textContent = msg;
  feedbackBubble.style.display = 'block';
  feedbackBubble.style.opacity = 0;
  setTimeout(() => {
    feedbackBubble.style.opacity = 1;
    setTimeout(() => {
      feedbackBubble.style.opacity = 0;
      setTimeout(() => {
        feedbackBubble.style.display = 'none';
      }, 800);
    }, 600);
  }, 50);
}

// --- Submission logic: only allow words in answers ---
function isValidAnswer(word) {
  const answers = window.beeDataRef?.value?.answers || [];
  return answers.includes(word.toLowerCase());
}

function capitalizeFirstLetter(string) 
{
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Patch submitWord to add found word if valid and not already found
function handleWordSubmission() {
  let word = getCurrentWord();
  const center = beeDataRef.value?.center_letter?.toUpperCase();
  if (word.length < 4) {
    showFeedbackBubble('Too short');
    return;
  }
  if (!word.includes(center)) {
    showFeedbackBubble('Missing center letter');
    return;
  }
  if (!isValidAnswer(word)) {
    showFeedbackBubble('Not in word list');
    return;
  }
  if (foundWords.includes(capitalizeFirstLetter(word))) {
    showFeedbackBubble('Already found');
    return;
  }
  word = capitalizeFirstLetter(word);
  foundWords.push(word);
  updateFoundWordsDisplay();
  showFeedbackBubble('Great job!');
  setCurrentWord('');
  updateCurrentWordDisplay();
  hiddenInput.value = '';
}

// Hook into submit button and Enter key
submitBtn.addEventListener('click', () => {
  handleWordSubmission();
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
