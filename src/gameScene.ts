import { scene } from "./setup";
import { GameState, GameStatus, Els } from './main';
import { isMoveLeft, isMoveRight, isShoot, resetUserEvents } from "./userEvents";
import { moveXShip, detectBulletCollisionAgainstXShip } from "./xShip";
import {
  getFreeBulletId, updateBullet, detectBulletCollisionAgainstEnemies,
  updateBulletInScene
} from "./bullets";
import {
  getFreeEnemyId, rebornEnemies, updateEnemy, updateEnemyInScene,
  handleEnemyCollision
} from "./enemies";
import { animateSphereBg } from "./sphereBg";
import { updateScore, updateHiScore } from "./score";
import { blasterSound, hitSound, wooshSound, explosionSound } from "./sounds";

export default function (
  gameState: GameState, els: Els, xShip: THREE.Mesh, sphereBg: THREE.Mesh
): GameState {
  const { scoreEl, hiScoreEl } = els;
  const enemiesHit: number[] = [];
  const freeBulletId = getFreeBulletId(gameState.bullets, isShoot);
  const freeEnemyId = getFreeEnemyId(gameState.enemies);
  let gameStatus = gameState.gameStatus;
  let score = gameState.score;

  detectBulletCollisionAgainstXShip(xShip, gameState.enemies, scene, {
    collisionCallback: enemy => {
      gameStatus = GameStatus.gameOver;
      score += enemy.score;
      resetUserEvents();
      enemiesHit.push(enemy.id);
      updateScore(scoreEl, score);
      updateHiScore(hiScoreEl, score);
    }
  });

  const bullets = gameState.bullets
    .map( bullet => updateBullet(bullet, freeBulletId, xShip.position.x, {
      bulletEmittedCallback: () => {
        blasterSound.seek(0).play();
      }
    }) )
    .map( bullet => detectBulletCollisionAgainstEnemies(bullet, gameState.enemies, scene, {
      collisionCallback: enemy => {
        score += enemy.score;
        enemiesHit.push(enemy.id);
        updateScore(scoreEl, score);
      }
    }) );

  const enemies = rebornEnemies(gameState.enemies)
    .map( enemy => handleEnemyCollision(enemy, enemiesHit, () => {
      hitSound.seek(0).play();
    }) )
    .map( enemy => updateEnemy(enemy, freeEnemyId, {
      gotPastScreenCallback: () => {
        gameStatus = GameStatus.gameOver;
        resetUserEvents();
        updateHiScore(hiScoreEl, score);
        wooshSound.seek(0).play();
      },
      destroyedCallback: () => {
        explosionSound.seek(0).play();
      }
    }) );

  bullets.forEach( bullet => updateBulletInScene(bullet, scene) );
  enemies.forEach( enemy => updateEnemyInScene(enemy, scene) );
  moveXShip(xShip, isMoveLeft, isMoveRight);

  animateSphereBg(sphereBg);

  return {
    gameStatus,
    score,
    bullets,
    enemies
  };
}
