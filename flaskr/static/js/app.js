// Game logic for Spelling Bee
import { positionHexagons, fetchBeeLetters, renderHoneycomb, addHoneycombClickListener } from "./honeycomb.js";
import { deleteChar, handleShuffleClick } from "./button.js";
import {
  setHeaderDate, setupHamburgerMenu
} from "./header.js";
import { foundWords, updateFoundWordsDisplay, showFeedbackBubble } from "./submissions.js";

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

window.addEventListener('DOMContentLoaded', async () => {
  hiddenInput.focus();

  submitBtn.addEventListener('click', () => {
    handleWordSubmission();
  });
  deleteBtn.addEventListener('click', () => {
    deleteChar({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput });
  });
  shuffleBtn.addEventListener('click', () => {
    handleShuffleClick({ beeData: beeDataRef, renderHoneycomb, honeycomb });
  });

  const gameContainer = document.querySelector('.game-container');
  gameContainer.addEventListener('click', () => hiddenInput.focus());

  addHoneycombClickListener({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput });

  setHeaderDate();
  setupHamburgerMenu();

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

window.addEventListener('resize', positionHexagons);

function isValidAnswer(word) {
  const answers = window.beeDataRef?.value?.answers || [];
  return answers.includes(word.toLowerCase());
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

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

// Expose beeDataRef globally for header.js popup access
window.beeDataRef = beeDataRef;
