// Game logic for Spelling Bee
import { positionHexagons, fetchBeeLetters, renderHoneycomb, addHoneycombClickListener } from "./honeycomb.js";
import { submitWord, deleteChar, handleShuffleClick } from "./button.js";
import {
  setHeaderDate, setupHamburgerMenu
} from "./header.js";
import { foundWords, updateFoundWordsDisplay, showFeedbackBubble } from "./submissions.js";
import { computeScore, computeRankings, findRank, computePointsToNextRank } from "./scoring.js";

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
  updateProgressUI();
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

function updateProgressUI() {
  const ranks = window.beeDataRef?.value?.rankings_order || [
    'Beginner', 'Good Start', 'Moving Up', 'Good', 'Solid', 'Nice', 'Great', 'Amazing', 'Genius', 'Queen Bee'
  ];
  const answers = window.beeDataRef?.value?.answers || [];
  const pangrams = window.beeDataRef?.value?.pangrams || [];
  const maxScore = computeScore(answers, pangrams);
  const score = computeScore(foundWords, pangrams);
  const { currRank, nextRank } = findRank(foundWords, answers, pangrams);
  const pointsToNext = computePointsToNextRank(foundWords, answers, pangrams);

  // Update level-label UI
  const rankTitle = document.getElementById('rank-title');
  const rankSubtitle = document.getElementById('rank-subtitle');
  if (rankTitle) rankTitle.textContent = currRank || ranks[0];
  if (rankSubtitle) {
    if (nextRank) {
      rankSubtitle.innerHTML = `<strong>${pointsToNext}</strong> to ${nextRank}`;
    } else {
      rankSubtitle.innerHTML = `<strong>Max</strong> rank!`;
    }
  }

  // Progress bar logic
  const currentRankIdx = ranks.indexOf(currRank || ranks[0]);
  renderProgressBar({ currentScore: score, maxScore, ranks, currentRankIdx });
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
  updateProgressUI(); // <-- update progress/rank after word submission
}

submitBtn.addEventListener('click', () => {
  handleWordSubmission();
});

// Expose beeDataRef globally for header.js popup access
window.beeDataRef = beeDataRef;

function renderProgressBar({
  currentScore,
  maxScore,
  ranks,
  currentRankIdx
}) {
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const scoreStart = document.getElementById('score-start');
  const scoreEnd = document.getElementById('score-end');

  // Remove old milestones
  progressBar.querySelectorAll('.milestone').forEach(dot => dot.remove());

  // Set fill
  const percent = Math.min((currentScore / maxScore) * 100, 100);
  progressFill.style.width = `${percent}%`;

  // Place milestones (including big start/end)
  const N = ranks.length;
  for (let i = 0; i < N; ++i) {
    const dot = document.createElement('div');
    dot.className = 'milestone';
    if (i === 0) {
      dot.classList.add('big');
      dot.textContent = currentScore;
    } else if (i === N - 1) {
      dot.classList.add('big', 'end');
      dot.textContent = maxScore;
    } else {
      dot.classList.add('small');
      dot.textContent = '';
    }
    // Highlight current rank
    if (i === currentRankIdx) {
      dot.classList.add('active');
    }
    // Evenly space all circles, including endpoints
    dot.style.left = `${(i / (N - 1)) * 100}%`;
    progressBar.appendChild(dot);
  }
  // Hide default score bubbles
  scoreStart.style.display = 'none';
  scoreEnd.style.display = 'none';
}
