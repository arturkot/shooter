import { Els } from './main';
import { GameStateData, GameStatus } from './gameState';
import { isShoot, resetUserEvents } from './userEvents';
import { destroyXShip } from "./xShip";
import {
  getFreeBulletId, updateBullet, updateBulletInScene
} from "./bullets";
import {
  getFreeEnemyId, updateEnemy, updateEnemyInScene
} from "./enemies";
import {LIVES} from './settings';

export default function (gameState: GameStateData, els: Els, xShip: THREE.Mesh): GameStateData {
  const { gameOverEl } = els;
  const freeBulletId = getFreeBulletId(gameState.bullets, isShoot);
  const freeEnemyId = getFreeEnemyId(gameState.enemies);
  const bullets = gameState.bullets
    .map( bullet => updateBullet(bullet, freeBulletId, xShip.position.x) );
  const enemies = gameState.enemies
    .map( enemy => updateEnemy(enemy, freeEnemyId) );
  let gameStatus = gameState.gameStatus;

  if (isShoot) {
    gameStatus = GameStatus.initial;
    resetUserEvents();
  }

  if (gameOverEl) {
    gameOverEl.classList.add('is-show');
  }

  destroyXShip(xShip);

  enemies.forEach( enemy => updateEnemyInScene(enemy) );
  bullets.forEach( bullet => updateBulletInScene(bullet) );

  return {
    score: gameState.score,
    enemies,
    bullets,
    gameStatus,
    lives: LIVES
  };
}
