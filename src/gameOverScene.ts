import {Els, GameStateData, XShipStateData} from './main';
import {GameStatus} from './gameState';
import {isShoot, resetUserEvents} from './userEvents';
import {destroyXShip} from './xShip';
import {Bullet, getFreeBulletId, updateBullet, updateBulletInScene} from './bullets';
import {Enemy, getFreeEnemyId, updateEnemy, updateEnemyInScene} from './enemies';

export default function (
  gameState: GameStateData,
  bullets: Bullet[],
  enemies: Enemy[],
  els: Els,
  lastXShipState: XShipStateData
) {
  const { gameOverEl } = els;
  const freeBulletId = getFreeBulletId(bullets, isShoot);
  const freeEnemyId = getFreeEnemyId(enemies);

  bullets
    .forEach( bullet => updateBullet(bullet, freeBulletId, lastXShipState.positionX) );
  enemies
    .forEach( enemy => updateEnemy(enemy, freeEnemyId) );

  if (isShoot) {
    gameState.gameStatus = GameStatus.initial;
    resetUserEvents();
  }

  if (gameOverEl) {
    gameOverEl.classList.add('is-show');
  }

  destroyXShip(lastXShipState);

  enemies.forEach( enemy => updateEnemyInScene(enemy) );
  bullets.forEach( bullet => updateBulletInScene(bullet) );
}
