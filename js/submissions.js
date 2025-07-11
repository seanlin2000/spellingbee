// --- Found Words Logic ---
export const foundWordsBox = document.querySelector('.found-words-box');
export const foundWordsCount = document.querySelector('.found-words-count');
export const foundWordsList = document.querySelector('.found-words-list');
export const foundWordsToggle = document.querySelector('.found-words-toggle');
export let foundWords = [];

export function updateFoundWordsDisplay() {
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

// --- Feedback Bubble Logic ---
export const feedbackBubble = document.createElement('div');
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

const feedbackBubbleContainer = document.getElementById('feedback-bubble-container');
if (feedbackBubbleContainer) {
  feedbackBubbleContainer.appendChild(feedbackBubble);
}

export function showFeedbackBubble(msg) {
  feedbackBubble.innerHTML = msg;
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
