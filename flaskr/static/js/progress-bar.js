// Progress bar and rank update logic moved from app.js
import { foundWords } from "./submissions.js";
import { computeScore, findRank, computePointsToNextRank } from "./scoring.js";

export function updateProgressUI(prevRank = null, didRankUp = false, currentScore = 0) {
  const ranks = window.beeDataRef?.value?.rankings_order || [
    'Beginner', 'Good Start', 'Moving Up', 'Good', 'Solid', 'Nice', 'Great', 'Amazing', 'Genius', 'Queen Bee'
  ];
  const answers = window.beeDataRef?.value?.answers || [];
  const pangrams = window.beeDataRef?.value?.pangrams || [];
  const maxScore = computeScore(answers, pangrams);
  // Use the global tracker if provided, else recalculate
  const { currRank, nextRank } = findRank(currentScore, answers, pangrams);
  const pointsToNext = computePointsToNextRank(answers, pangrams, currentScore);

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
  renderProgressBar({ currentScore, maxScore, ranks, currentRankIdx, currRank });

  // Return whether a rank up occurred
  if (prevRank && currRank && prevRank !== currRank) {
    return true;
  }
  return false;
}

// Progress bar rendering logic moved from app.js
export function renderProgressBar({
  currentScore,
  maxScore,
  ranks,
  currentRankIdx,
  currRank,
  prevRankIdx = null
}) {
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const scoreStart = document.getElementById('score-start');
  const scoreEnd = document.getElementById('score-end');

  // Remove old milestones
  progressBar.querySelectorAll('.milestone').forEach(dot => dot.remove());
  // Remove any previous yellow fill bar
  let yellowFill = progressBar.querySelector('.progress-rank-fill');
  if (yellowFill) yellowFill.remove();

  // Set fill (for total score)
  const percent = Math.min((currentScore / maxScore) * 100, 100);
  progressFill.style.width = `${percent}%`;

  // Add yellow fill for rank progress (from 0 to current big circle)
  if (currentRankIdx > 0) {
    yellowFill = document.createElement('div');
    yellowFill.className = 'progress-rank-fill';
    yellowFill.style.position = 'absolute';
    yellowFill.style.left = '0';
    yellowFill.style.top = '0';
    yellowFill.style.height = '100%';
    yellowFill.style.background = '#ffe066';
    yellowFill.style.borderRadius = '4px';
    yellowFill.style.zIndex = 1;
    yellowFill.style.transition = 'width 0.3s cubic-bezier(.4,1.3,.6,1)';
    yellowFill.style.width = `${(currentRankIdx / (ranks.length - 1)) * 100}%`;
    progressBar.insertBefore(yellowFill, progressFill);
  }

  // Place milestones (including big start/end)
  const N = ranks.length;
  for (let i = 0; i < N; ++i) {
    const dot = document.createElement('div');
    dot.className = 'milestone';
    // Queen Bee edge case: highlight only the last circle
    if (currRank === 'Queen Bee' && i === N - 1) {
      dot.classList.add('big', 'end', 'active');
      dot.textContent = maxScore;
      dot.style.background = '#ffe066'; // Shade in the far right circle
    } else if (i === 0) {
      // Start circle
      if (currentRankIdx === 0) {
        dot.classList.add('big', 'active');
        dot.textContent = currentScore;
      } else {
        dot.classList.add('small', 'active');
        dot.textContent = '';
      }
    } else if (i === N - 1) {
      // End circle
      dot.classList.add('big', 'end');
      dot.textContent = maxScore;
    } else if (i === currentRankIdx) {
      // Current rank: big yellow circle with score
      dot.classList.add('big', 'active');
      dot.textContent = currentScore;
    } else if (i < currentRankIdx) {
      // Passed ranks: small yellow circle
      dot.classList.add('small', 'active');
    } else {
      // Not yet reached: small gray circle
      dot.classList.add('small');
    }
    // Evenly space all circles, including endpoints
    dot.style.left = `${(i / (N - 1)) * 100}%`;
    progressBar.appendChild(dot);
  }
  // Hide default score bubbles
  scoreStart.style.display = 'none';
  scoreEnd.style.display = 'none';
}
