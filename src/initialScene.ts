import * as settings from './settings';
import { isShoot, resetUserEvents } from "./userEvents";
import { GameState, GameStatus, Els } from './main';
import { updateScore } from "./score";
import { resetEnemiesAppearanceInScene } from "./enemies";
import { resetXShip } from "./xShip";
import { updateBulletInScene } from "./bullets";
import { updateEnemyInScene } from "./enemies";

export default function (initialGameState: GameState, els: Els, xShip: THREE.Mesh): GameState {
  const { gameOverEl, scoreEl } = els;
  const enemies = initialGameState.enemies;
  const bullets = initialGameState.bullets;
  const score = initialGameState.score;
  const lives= initialGameState.lives;
  let gameStatus = initialGameState.gameStatus;

  if (isShoot) {
    gameStatus = GameStatus.game;
    resetUserEvents(200);
  }

  if (gameOverEl) {
    gameOverEl.classList.remove('is-show');
  }

  if (els.livesEl) {
    els.livesEl.textContent = String(initialGameState.lives);
  }

  updateScore(scoreEl, score);
  resetEnemiesAppearanceInScene(enemies);
  resetXShip(xShip, settings.XSHIP_Y);

  enemies.forEach( enemy => updateEnemyInScene(enemy) );
  bullets.forEach( bullet => updateBulletInScene(bullet) );

  return {
    gameStatus,
    score,
    bullets,
    enemies,
    lives
  };
}
