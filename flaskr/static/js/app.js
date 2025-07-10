// Game logic for Spelling Bee
import { positionHexagons, fetchBeeLetters, renderHoneycomb, addHoneycombClickListener } from "./honeycomb.js";
import { submitWord, deleteChar, handleShuffleClick } from "./button.js";
import {
  setHeaderDate, setupHamburgerMenu
} from "./header.js";
import { foundWords, updateFoundWordsDisplay, showFeedbackBubble } from "./submissions.js";
import { computeScore, computeRankings, findRank, computePointsToNextRank } from "./scoring.js";
import { updateProgressUI, renderProgressBar } from "./progress-bar.js";

let currentWord = '';
let beeData = null; // Store the current bee letters
const currentWordDiv = document.querySelector('.current-word');
const hiddenInput = document.querySelector('.word-input');
const deleteBtn = document.querySelector('.delete-btn');
const submitBtn = document.querySelector('.submit-btn');
const shuffleBtn = document.querySelector('.shuffle-btn');
const honeycomb = document.querySelector('.honeycomb');
let currentScore = 0; // Global tracker for the user's score

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

  // Remove submitWord call here; only use handleWordSubmission for submitBtn
  submitBtn.addEventListener('click', () => {
    setCurrentWord(hiddenInput.value.trim().toUpperCase()); // Only trim, do not uppercase
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
    console.error('Error fetching bee letters:', e); // Log the error for debugging
    beeData = { center_letter: 'A', outer_letters: ['B','C','D','E','F','G'] };
    beeDataRef.value = beeData;
    renderHoneycomb(beeData.center_letter, beeData.outer_letters);
  }
  positionHexagons();

  // After loading beeDataRef, render the progress bar and update rank UI
  updateProgressUI(null, null, 0);
});

hiddenInput.addEventListener('input', e => {
  setCurrentWord(hiddenInput.value.trim().toUpperCase()); // Only trim, do not uppercase
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
  let word = getCurrentWord().trim().toUpperCase();
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
    // Do NOT clear the word for invalid answer
    return;
  }
  if (foundWords.includes(capitalizeFirstLetter(word))) {
    showFeedbackBubble('Already found');
    return;
  }
  word = capitalizeFirstLetter(word);
  // Get previous rank before adding word (use score, not foundWords)
  const ranks = window.beeDataRef?.value?.rankings_order || [
    'Beginner', 'Good Start', 'Moving Up', 'Good', 'Solid', 'Nice', 'Great', 'Amazing', 'Genius', 'Queen Bee'
  ];
  const answers = window.beeDataRef?.value?.answers || [];
  const pangrams = window.beeDataRef?.value?.pangrams || [];
  // Calculate previous score (before adding this word)
  const prevScore = currentScore;
  const { currRank: prevRank } = findRank(prevScore, answers, pangrams);

  // Compute points for this word
  const points = computeScore([word.toLowerCase()], pangrams);
  currentScore += points; // Update global score

  foundWords.push(word);
  updateFoundWordsDisplay();
  // Pangram feedback or random positive feedback or rank up
  let didPangram = false;
  let feedbackMsg = '';
  if (pangrams.includes(word.toLowerCase())) {
    feedbackMsg = '<strong>Pangram!</strong>';
    didPangram = true;
    feedbackMsg += ` <span style='color:#222;font-weight:700;'>+${points}</span>`;
    showFeedbackBubble(feedbackMsg);
    setCurrentWord('');
    updateCurrentWordDisplay();
    hiddenInput.value = '';
    updateProgressUI(null, false, currentScore); // Don't show rank up if pangram
    return;
  }
  setCurrentWord('');
  updateCurrentWordDisplay();
  hiddenInput.value = '';
  const didRankUp = updateProgressUI(prevRank, false, currentScore);
  if (didRankUp) {
    // Show the new rank in bold with exclamation point
    const { currRank } = findRank(currentScore, answers, pangrams);
    feedbackMsg = `<strong>${currRank}</strong>!`;
  } else {
    const feedbacks = ['Great job!', 'Nice!', 'Good!'];
    const msg = feedbacks[Math.floor(Math.random() * feedbacks.length)];
    feedbackMsg = msg;
  }
  feedbackMsg += ` <span style='color:#222;font-weight:700;'>+${points}</span>`;
  showFeedbackBubble(feedbackMsg);
}

// Expose beeDataRef globally for header.js popup access
window.beeDataRef = beeDataRef;
