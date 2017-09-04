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

function resetScoreMultiplierAndCountScore (lastGameState: GameStateData, els: Els) {
  lastGameState.score += lastGameState.scoreChunk * lastGameState.scoreMultiplier;
  updateScore(els.scoreEl, lastGameState.score);

  lastGameState.scoreMultiplier = 0;
  lastGameState.scoreChunk = 0;

  if (els.bonusBarEl) {
    els.bonusBarEl.classList.remove('is-active');
  }
}

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

        resetScoreMultiplierAndCountScore(lastGameState, els);
        enemiesHit.push(enemy.id);
        updateScore(scoreEl, lastGameState.score);
        updateHiScore(hiScoreEl, lastGameState.score);
      }
    });

    bullets.forEach( bullet => {
      updateBullet(bullet, freeBulletId, xShip.position.x, {
        bulletEmittedCallback () {
          blasterSound.seek(0).play();
        },
        bulletReachedScreenEndCallback () {
          resetScoreMultiplierAndCountScore(lastGameState, els);
        }
      });

      detectBulletCollisionAgainstEnemies(bullet, enemies, {
        collisionCallback: enemy => {
          lastGameState.scoreChunk += enemy.score;
          enemiesHit.push(enemy.id);
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

          resetScoreMultiplierAndCountScore(lastGameState, els);
          updateHiScore(hiScoreEl, lastGameState.score);
          wooshSound.seek(0).play();
        },
        destroyedCallback: () => {
          explosionSound.seek(0).play();
          lastGameState.scoreMultiplier += 1;

          if (lastGameState.scoreMultiplier > 1 && els.lastScoreEl && els.scoreMultiplierEl && els.bonusBarEl) {
            els.bonusBarEl.classList.add('is-active');
            els.lastScoreEl.textContent = String(lastGameState.scoreChunk);
            els.scoreMultiplierEl.textContent = String(lastGameState.scoreMultiplier);
          }
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
