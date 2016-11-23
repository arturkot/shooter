import { range } from "lodash";

export function updateScore (scoreEl, score) {
  scoreEl.textContent = _formatScore(score);
}

export function updateHiScore ({ hiScoreEl, score }) {
  const HI_SCORE_KEY = 'hi-score';
  const hiScore = parseInt( localStorage.getItem(HI_SCORE_KEY), 10) || 0;

  if (score !== undefined && hiScore < score) {
    localStorage.setItem(HI_SCORE_KEY, score);
  }

  if (hiScoreEl) {
    hiScoreEl.textContent = _formatScore(hiScore);
  }
}

function _formatScore(score) {
  const MAX_WIDTH = 4;
  const scoreString = String(score);
  const zeros = range(MAX_WIDTH - scoreString.length).map( () => 0 ).join('');

  return zeros + scoreString;
}
