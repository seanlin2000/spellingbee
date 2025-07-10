export const RANKINGS = {
  "Beginner": 0,
  "Good Start": 2,
  "Moving Up": 5,
  "Good": 8,
  "Solid": 15,
  "Nice": 25,
  "Great": 40,
  "Amazing": 50,
  "Genius": 70,
  "Queen Bee": 100
};

function nytRound(x) {
  const frac = x - Math.floor(x);
  if (frac < 0.5) return Math.floor(x);
  return Math.ceil(x);
}

export function computeScore(answers, pangrams) {
  let score = 0;
  for (const answer of answers) {
    if (answer.length === 4) {
      score += 1;
      continue;
    }
    if (pangrams.includes(answer)) {
      score += 7;
    }
    score += answer.length;
  }
  return score;
}

export function computeRankings(maxScore) {
  const rankingScores = {};
  for (const ranking in RANKINGS) {
    const cutoff = RANKINGS[ranking];
    const cutoffScore = nytRound((cutoff / 100) * maxScore);
    rankingScores[ranking] = cutoffScore;
  }
  return rankingScores;
}

export function findRank(score, answers, pangrams) {
  const maxScore = computeScore(answers, pangrams);
  const rankingScores = computeRankings(maxScore);
  const descending = Object.entries(rankingScores).sort((a, b) => b[1] - a[1]);
  let nextRank = null, currRank = null;
  for (const [ranking, cutoff] of descending) {
    if (score >= cutoff) {
      currRank = ranking;
      break;
    }
    nextRank = ranking;
    console.log(currRank, nextRank)
  }
  return { currRank, nextRank };
}

export function computePointsToNextRank(answers, pangrams, currentScore) {
  // Always use the provided currentScore
  const score = currentScore;
  const maxScore = computeScore(answers, pangrams);
  const rankingScores = computeRankings(maxScore);
  const { nextRank } = findRank(score, answers, pangrams);
  return nextRank ? (rankingScores[nextRank] - score) : 0;
}