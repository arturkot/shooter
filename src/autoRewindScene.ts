import {clockGet, clockReset} from './clock';
import {GameState, GameStateData, GameStatus} from './gameState';
import {Els} from './main';
import {updateEnemyInScene} from './enemies';
import {updateBulletInScene} from './bullets';
import {animateSphereBg} from './sphereBg';
import {moveXShip} from './xShip';
import {isMoveLeft, isMoveRight, mouseX} from './userEvents';

export default function (
  prevGameStates: GameState,
  lastGameState: GameStateData,
  prevGameState: GameStateData,
  els: Els,
  xShip: THREE.Mesh,
  sphereBg: THREE.Mesh
): GameStateData | false {
  if (prevGameState.gameStatus !== lastGameState.gameStatus) {
    clockReset();

    if (els.flashEl) {
      els.flashEl.classList.add('is-active');
    }

    return Object.assign({}, lastGameState, {
      gameStatus: GameStatus.autoRewind
    });
  }

  if (clockGet() > 0.5) {
    const prevState = prevGameStates.use();

    if (prevState) {
      if (els.flashEl) {
        els.flashEl.classList.remove('is-active');
      }

      prevState.enemies.forEach(enemy => updateEnemyInScene(enemy));
      prevState.bullets.forEach(bullet => updateBulletInScene(bullet));

      animateSphereBg(sphereBg, 'back');
      moveXShip(xShip, isMoveLeft, isMoveRight, {
        mouseX
      });

      return false;
    } else {
      return Object.assign({}, prevGameStates.get(), {
        lives: lastGameState.lives,
        gameStatus: GameStatus.game
      });
    }
  }

  return false;
}
