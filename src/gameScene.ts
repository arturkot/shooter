import {Els, GameStateData} from './main';
import {GameStatus} from './gameState';
import {isMoveLeft, isMoveRight, mouseX, resetUserEvents} from './userEvents';
import {detectEnemyCollisionAgainstXShip, moveXShip} from './xShip';
import {
  Bullet, detectBulletCollisionAgainstEnemies, getFreeBulletId, updateBullet,
  updateBulletInScene
} from './bullets';
import {Enemy, getFreeEnemyId, handleEnemyCollision, rebornEnemies, updateEnemy, updateEnemyInScene} from './enemies';
import {animateSphereBg} from './sphereBg';
import {updateHiScore, updateScore} from './score';
import {blasterSound, explosionSound, hitSound, wooshSound} from './sounds';
import {clockGet, clockReset} from './clock';

export default function (
  bullets: Bullet[],
  enemies: Enemy[],
  lastGameState: GameStateData,
  prevGameState: GameStateData,
  els: Els,
  xShip: THREE.Mesh,
  sphereBg: THREE.Mesh
) {
  if (prevGameState.gameStatus === GameStatus.autoRewind) {
    clockReset();

    if (els.flashEl) {
      els.flashEl.classList.add('is-active');
    }

    const newGameState = Object.assign(lastGameState, {
      gameStatus: GameStatus.game
    });

    return {
      gameStateData: newGameState,
      enemies: enemies,
      bullets: bullets
    };
  }

  if (clockGet() > 0.5) {
    if (els.flashEl) {
      els.flashEl.classList.remove('is-active');
    }

    const {scoreEl, hiScoreEl} = els;
    const enemiesHit: number[] = [];
    const freeBulletId = getFreeBulletId(bullets, true);
    const freeEnemyId = getFreeEnemyId(enemies);

    detectEnemyCollisionAgainstXShip(xShip, enemies, {
      collisionCallback: enemy => {
        lastGameState.lives = lastGameState.lives - 1;

        if (lastGameState.lives < 0) {
          lastGameState.gameStatus = GameStatus.gameOver;
          resetUserEvents();
        } else if (els.livesEl) {
          els.livesEl.textContent = String(lastGameState.lives);
          lastGameState.gameStatus = GameStatus.autoRewind;
        }

        lastGameState.score += enemy.score;
        enemiesHit.push(enemy.id);
        updateScore(scoreEl, lastGameState.score);
        updateHiScore(hiScoreEl, lastGameState.score);
      }
    });

    bullets.forEach( bullet => {
      updateBullet(bullet, freeBulletId, xShip.position.x, {
        bulletEmittedCallback () {
          blasterSound.seek(0).play();
        }
      });

      detectBulletCollisionAgainstEnemies(bullet, enemies, {
        collisionCallback: enemy => {
          lastGameState.score += enemy.score;
          enemiesHit.push(enemy.id);
          updateScore(scoreEl, lastGameState.score);
        }
      });
    });

    rebornEnemies(enemies);

    enemies.forEach(enemy => {
      handleEnemyCollision(enemy, enemiesHit, () => {
        hitSound.seek(0).play();
      });

      updateEnemy(enemy, freeEnemyId, {
        gotPastScreenCallback: () => {
          lastGameState.lives = lastGameState.lives - 1;

          if (lastGameState.lives < 0) {
            resetUserEvents();
            lastGameState.gameStatus = GameStatus.gameOver;
          } else if (els.livesEl) {
            els.livesEl.textContent = String(lastGameState.lives);
            lastGameState.gameStatus = GameStatus.autoRewind;
          }

          updateHiScore(hiScoreEl, lastGameState.score);
          wooshSound.seek(0).play();
        },
        destroyedCallback: () => {
          explosionSound.seek(0).play();
        }
      });
    });

    bullets.forEach(bullet => updateBulletInScene(bullet));
    enemies.forEach(enemy => updateEnemyInScene(enemy));

    moveXShip(xShip, isMoveLeft, isMoveRight, {
      mouseX
    });

    animateSphereBg(sphereBg);
  }
}
