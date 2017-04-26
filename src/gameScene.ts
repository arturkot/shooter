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
  lastBullets: Bullet[],
  lastEnemies: Enemy[],
  lastGameState: GameStateData,
  prevGameState: GameStateData,
  els: Els,
  xShip: THREE.Mesh,
  sphereBg: THREE.Mesh
): {
    gameStateData: GameStateData,
    bullets: Bullet[],
    enemies: Enemy[],
} | {} {
  if (prevGameState.gameStatus === GameStatus.autoRewind) {
    clockReset();

    if (els.flashEl) {
      els.flashEl.classList.add('is-active');
    }

    const newGameState = Object.assign({}, lastGameState, {
      gameStatus: GameStatus.game
    });

    return {
      gameStateData: newGameState,
      enemies: lastEnemies,
      bullets: lastBullets
    };
  }

  if (clockGet() > 0.5) {
    if (els.flashEl) {
      els.flashEl.classList.remove('is-active');
    }

    const {scoreEl, hiScoreEl} = els;
    const enemiesHit: number[] = [];
    const freeBulletId = getFreeBulletId(lastBullets, true);
    const freeEnemyId = getFreeEnemyId(lastEnemies);
    let gameStatus = lastGameState.gameStatus;
    let score = lastGameState.score;
    let lives = lastGameState.lives;

    detectEnemyCollisionAgainstXShip(xShip, lastEnemies, {
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

    const bullets = lastBullets
      .map(bullet => updateBullet(bullet, freeBulletId, xShip.position.x, {
        bulletEmittedCallback () {
          blasterSound.seek(0).play();
        }
      }))
      .map(bullet => detectBulletCollisionAgainstEnemies(bullet, lastEnemies, {
        collisionCallback: enemy => {
          score += enemy.score;
          enemiesHit.push(enemy.id);
          updateScore(scoreEl, score);
        }
      }));

    const enemies = rebornEnemies(lastEnemies)
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
      gameStateData: { gameStatus, lives, score },
      bullets,  enemies
    };
  }

  return {};
}
