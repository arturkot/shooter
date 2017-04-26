import {Els, GameStateData} from './main';
import { GameStatus } from './gameState';
import { isShoot, resetUserEvents } from './userEvents';
import { destroyXShip } from "./xShip";
import {
  Bullet,
  getFreeBulletId, updateBullet, updateBulletInScene
} from "./bullets";
import {
  Enemy,
  getFreeEnemyId, updateEnemy, updateEnemyInScene
} from "./enemies";
import {LIVES} from './settings';

export default function (
  gameState: GameStateData,
  bullets: Bullet[],
  enemies: Enemy[],
  els: Els,
  xShip: THREE.Mesh
) {
  const { gameOverEl } = els;
  const freeBulletId = getFreeBulletId(bullets, isShoot);
  const freeEnemyId = getFreeEnemyId(enemies);
  const newBullets = bullets
    .map( bullet => updateBullet(bullet, freeBulletId, xShip.position.x) );
  const newEnemies = enemies
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

  newEnemies.forEach( enemy => updateEnemyInScene(enemy) );
  newBullets.forEach( bullet => updateBulletInScene(bullet) );

  return {
    gameStateData: {
      score: gameState.score,
      gameStatus,
      lives: LIVES
    },
    bullets: newBullets,
    enemies: newEnemies
  };
}
