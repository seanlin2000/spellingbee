// Game logic for Spelling Bee
import { positionHexagons, renderHoneycomb, addHoneycombClickListener, setInputFocus } from "./honeycomb.js";
import { deleteChar, handleShuffleClick } from "./button.js";
import { setHeaderDate, setupHamburgerMenu } from "./header.js";
import { foundWords, updateFoundWordsDisplay, showFeedbackBubble } from "./submissions.js";
import { computeScore, findRank } from "./scoring.js";
import { updateProgressUI } from "./progress-bar.js";

let currentWord = '';
const currentWordDiv = document.querySelector('.current-word');
const hiddenInput = document.querySelector('.word-input');
const deleteBtn = document.querySelector('.delete-btn');
const submitBtn = document.querySelector('.submit-btn');
const shuffleBtn = document.querySelector('.shuffle-btn');
let currentScore = 0; // Globasl tracker for the user's score
let globalCurrentDate = null;

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
    } else if (ch == beeDataRef.value.center_letter.toUpperCase()) {
      html += `<span style="color:#FFCE1C">${ch}</span>`;
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
  // Only focus hiddenInput on desktop devices
  setInputFocus(hiddenInput);

  // Remove submitWord call here; only use handleWordSubmission for submitBtn
  submitBtn.addEventListener('click', () => {
    setCurrentWord(hiddenInput.value.trim().toUpperCase());
    handleWordSubmission();
    saveGameState();
  });
  deleteBtn.addEventListener('click', () => {
    deleteChar({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput });
  });
  shuffleBtn.addEventListener('click', () => {
    const honeycomb = document.querySelector('.honeycomb');
    handleShuffleClick({ beeData: beeDataRef, renderHoneycomb, honeycomb });
  });

  const gameContainer = document.querySelector('.game-container');
  gameContainer.addEventListener('click', () => {
    setInputFocus(hiddenInput);
  });

  addHoneycombClickListener({ getCurrentWord, setCurrentWord, updateCurrentWordDisplay, hiddenInput });

  setHeaderDate();
  setupHamburgerMenu();
  try {
    const data = await fetchBeeLetters();
    beeDataRef.value = data;
    renderHoneycomb(data.center_letter, data.outer_letters);
    // Set logo-date from globalCurrentDate
    const logoDateEl = document.querySelector('.logo-date');
    if (logoDateEl && globalCurrentDate) {
      logoDateEl.textContent = `${globalCurrentDate.slice(0,4)}-${globalCurrentDate.slice(4,6)}-${globalCurrentDate.slice(6,8)}`;
    }
    // Only restore game state after globalCurrentDate is set
    restoreGameState();
    saveGameState();
  } catch (e) {
    console.error('Error fetching bee letters:', e); // Log the error for debugging
    beeDataRef.value = { center_letter: 'A', outer_letters: ['B','C','D','E','F','G'] };
    renderHoneycomb(beeDataRef.value.center_letter, beeDataRef.value.outer_letters);
  }
  positionHexagons();
  updateProgressUI(null, false, currentScore);
});

function restoreGameState() {
  // Only clear if both storedDate and globalCurrentDate are valid and different
  const storedDate = sessionStorage.getItem('globalCurrentDate');
  if (storedDate && globalCurrentDate && storedDate !== globalCurrentDate) {
    sessionStorage.clear();
    return;
  }
  // Restore state if date matches
  const score = sessionStorage.getItem('currentScore');
  if (score !== null) currentScore = JSON.parse(score);
  const beeData = sessionStorage.getItem('beeDataRef');
  if (beeData !== null) beeDataRef.value = JSON.parse(beeData);
  const words = sessionStorage.getItem('foundWords');
  if (words !== null) {
    foundWords.length = 0;
    foundWords.push(...JSON.parse(words));
  }
  // Update found words display after restoring
  updateFoundWordsDisplay();
}

function saveGameState() {
  sessionStorage.setItem('currentScore', JSON.stringify(currentScore));
  sessionStorage.setItem('beeDataRef', JSON.stringify(beeDataRef.value));
  sessionStorage.setItem('foundWords', JSON.stringify(foundWords));
  sessionStorage.setItem('globalCurrentDate', globalCurrentDate);
}

hiddenInput.addEventListener('input', e => {
  setCurrentWord(hiddenInput.value.trim().toUpperCase());
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
    return;
  }
  if (foundWords.includes(capitalizeFirstLetter(word))) {
    showFeedbackBubble('Already found');
    return;
  }
  word = capitalizeFirstLetter(word);
  const answers = window.beeDataRef?.value?.answers || [];
  const pangrams = window.beeDataRef?.value?.pangrams || [];
  const prevScore = currentScore;
  const { currRank: prevRank } = findRank(prevScore, answers, pangrams);
  const points = computeScore([word.toLowerCase()], pangrams);
  currentScore += points;
  foundWords.push(word);
  updateFoundWordsDisplay();
  let feedbackMsg = '';
  if (pangrams.includes(word.toLowerCase())) {
    feedbackMsg = '<strong>Pangram!</strong>';
    feedbackMsg += ` <span style='color:#222;font-weight:700;'>+${points}</span>`;
    showFeedbackBubble(feedbackMsg);
    updateProgressUI(null, false, currentScore);
    finalizeSubmission();
    return;
  }
  const didRankUp = updateProgressUI(prevRank, false, currentScore);
  if (didRankUp) {
    const { currRank } = findRank(currentScore, answers, pangrams);
    feedbackMsg = `<strong>${currRank}</strong>!`;
  } else {
    const feedbacks = ['Great job!', 'Nice!', 'Good!'];
    feedbackMsg = feedbacks[Math.floor(Math.random() * feedbacks.length)];
  }
  feedbackMsg += ` <span style='color:#222;font-weight:700;'>+${points}</span>`;
  showFeedbackBubble(feedbackMsg);
  finalizeSubmission();
}

function updateAfterSubmission() {
  setCurrentWord('');
  updateCurrentWordDisplay();
  hiddenInput.value = '';
}

function finalizeSubmission() {
  updateAfterSubmission();
  saveGameState();
}

// SHARE BUTTON FUNCTIONALITY
const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    // Get rank from DOM
    const rank = document.getElementById('rank-title')?.textContent?.trim() || 'Unknown';
    // Use currentScore variable for score
    const score = typeof currentScore === 'number' ? currentScore : 0;
    // Get found words from the JS state
    let words = foundWords;
    // Sort by length descending, pick top 3
    const topWords = words.sort((a, b) => b.length - a.length).slice(0, 3);
    const topWordsStr = topWords.join(', ') || 'N/A';
    // Get today's date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    // Compose message
    const shareText = `I hit ${rank} rank with a score of ${score} on NYT Spelling Bee today! I found ${words.length} words. My most impressive words were ${topWordsStr}. (${dateStr})`;
    try {
      await navigator.clipboard.writeText(shareText);
      shareBtn.textContent = 'Copied!';
      setTimeout(() => { shareBtn.textContent = 'Share'; }, 1500);
    } catch (e) {
      shareBtn.textContent = 'Failed to copy';
      setTimeout(() => { shareBtn.textContent = 'Share'; }, 1500);
    }
  });
}

// Expose beeDataRef globally for header.js popup access
window.beeDataRef = beeDataRef;

const isLocal = location.hostname === "localhost";
const baseUrl = isLocal
  ? "../sample_data/"
  : "https://seanlin2000.github.io/spellingbee/data/";

async function fetchBeeLetters() {
  const datesResp = await fetch(baseUrl + "dates.json");
  const datesData = await datesResp.json();
  globalCurrentDate = datesData.current_date;
  const beeDataUrl = baseUrl + `bee_${globalCurrentDate}.json`;
  const beeResp = await fetch(beeDataUrl);
  const beeData = await beeResp.json();
  return beeData;
}
