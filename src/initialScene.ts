import * as settings from './settings';
import { isShoot, resetUserEvents } from "./userEvents";
import {Els, GameStateData} from './main';
import { GameStatus } from './gameState';
import { updateScore } from "./score";
import {Enemy, resetEnemiesAppearanceInScene} from "./enemies";
import { resetXShip } from "./xShip";
import {Bullet, updateBulletInScene} from "./bullets";
import { updateEnemyInScene } from "./enemies";

export default function (
  initialGameState: GameStateData,
  lastGameState: GameStateData,
  bullets: Bullet[],
  enemies: Enemy[],
  els: Els,
  xShip: THREE.Mesh
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
    els.livesEl.textContent = String(initialGameState.lives);
  }

  updateScore(scoreEl, initialGameState.score);
  resetEnemiesAppearanceInScene(enemies);
  resetXShip(xShip, settings.XSHIP_Y);

  enemies.forEach( enemy => updateEnemyInScene(enemy) );
  bullets.forEach( bullet => updateBulletInScene(bullet) );
}
