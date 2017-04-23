import { Els } from './main';
import { GameStateData, GameStatus } from './gameState';
import {isMoveLeft, isMoveRight, mouseX, resetUserEvents} from "./userEvents";
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
import {clockGet, clockReset} from './clock';
import {update} from 'immupdate';

export default function (
  lastGameState: GameStateData, prevGameState: GameStateData, els: Els, xShip: THREE.Mesh, sphereBg: THREE.Mesh
): GameStateData | false {
  if (prevGameState.gameStatus === GameStatus.autoRewind) {
    clockReset();

    if (els.flashEl) {
      els.flashEl.classList.add('is-active');
    }

    return update(lastGameState, {
      gameStatus: GameStatus.game
    });
  }

  if (clockGet() > 0.5) {
    if (els.flashEl) {
      els.flashEl.classList.remove('is-active');
    }

    const {scoreEl, hiScoreEl} = els;
    const enemiesHit: number[] = [];
    const freeBulletId = getFreeBulletId(lastGameState.bullets, true);
    const freeEnemyId = getFreeEnemyId(lastGameState.enemies);
    let gameStatus = lastGameState.gameStatus;
    let score = lastGameState.score;
    let lives = lastGameState.lives;

    detectBulletCollisionAgainstXShip(xShip, lastGameState.enemies, {
      collisionCallback: enemy => {
        lives = lives - 1;

        if (lives < 0) {
          gameStatus = GameStatus.gameOver;
          resetUserEvents();
        } else if (els.livesEl) {
          els.livesEl.textContent = String(lives);
          gameStatus = GameStatus.autoRewind;
        }

        score += enemy.score;
        enemiesHit.push(enemy.id);
        updateScore(scoreEl, score);
        updateHiScore(hiScoreEl, score);
      }
    });

    const bullets = lastGameState.bullets
      .map(bullet => updateBullet(bullet, freeBulletId, xShip.position.x, {
        bulletEmittedCallback () {
          blasterSound.seek(0).play();
        }
      }))
      .map(bullet => detectBulletCollisionAgainstEnemies(bullet, lastGameState.enemies, {
        collisionCallback: enemy => {
          score += enemy.score;
          enemiesHit.push(enemy.id);
          updateScore(scoreEl, score);
        }
      }));

    const enemies = rebornEnemies(lastGameState.enemies)
      .map(enemy => handleEnemyCollision(enemy, enemiesHit, () => {
        hitSound.seek(0).play();
      }))
      .map(enemy => updateEnemy(enemy, freeEnemyId, {
        gotPastScreenCallback: () => {
          lives = lives - 1;

          if (lives < 0) {
            resetUserEvents();
            gameStatus = GameStatus.gameOver;
          } else if (els.livesEl) {
            els.livesEl.textContent = String(lives);
            gameStatus = GameStatus.autoRewind;
          }

          updateHiScore(hiScoreEl, score);
          wooshSound.seek(0).play();
        },
        destroyedCallback: () => {
          explosionSound.seek(0).play();
        }
      }));

    bullets.forEach(bullet => updateBulletInScene(bullet));
    enemies.forEach(enemy => updateEnemyInScene(enemy));

    moveXShip(xShip, isMoveLeft, isMoveRight, {
      mouseX
    });

    animateSphereBg(sphereBg);

    return {
      gameStatus,
      score,
      bullets,
      enemies,
      lives
    };
  }

  return false;
}
