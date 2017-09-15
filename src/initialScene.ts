import { isShoot, resetUserEvents } from "./userEvents";
import {Els, GameStateData} from './main';
import { GameStatus } from './gameState';
import { updateScore } from "./score";
import {Enemy} from "./enemies";
import {resetEnemiesAppearanceInScene, updateEnemyInScene} from "./render/enemies";

export default function (
  lastGameState: GameStateData,
  enemies: Enemy[],
  els: Els
) {
  const { gameOverEl, scoreEl } = els;

  if (isShoot) {
    lastGameState.gameStatus = GameStatus.game;
    resetUserEvents(200);
  }

  if (gameOverEl) {
    gameOverEl.classList.remove('is-show');
  }

  if (els.livesEl) {
    els.livesEl.textContent = String(lastGameState.lives);
  }

  updateScore(scoreEl, lastGameState.score);
  resetEnemiesAppearanceInScene(enemies);

  enemies.forEach( enemy => updateEnemyInScene(enemy) );
}
