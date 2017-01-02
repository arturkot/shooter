import { range } from "lodash";

export function updateScore (scoreEl: Element | null, score?: number) {
  if (!scoreEl || !score) { return; }
  scoreEl.textContent = _formatScore(score);
}

export function updateHiScore (hiScoreEl: Element | null, score: number) {
  const HI_SCORE_KEY = 'hi-score';
  const scoreString = String( localStorage.getItem(HI_SCORE_KEY) );
  const hiScore = parseInt(scoreString, 10) || 0;

  if (score !== undefined && hiScore < score) {
    localStorage.setItem(HI_SCORE_KEY, String(score) );
  }

  if (hiScoreEl) {
    hiScoreEl.textContent = _formatScore(hiScore);
  }
}

function _formatScore(score: number) {
  const MAX_WIDTH = 4;
  const scoreString = String(score);
  const zeros = range(MAX_WIDTH - scoreString.length).map( () => 0 ).join('');

  return zeros + scoreString;
}
