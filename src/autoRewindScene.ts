import {clockGet, clockReset} from './clock';
import {GameState, GameStatus} from './gameState';
import {Els, GameStateData} from './main';
import {Enemy, updateEnemyInScene} from './enemies';
import {Bullet, updateBulletInScene} from './bullets';
import {animateSphereBg} from './sphereBg';
import {moveXShip} from './xShip';
import {isMoveLeft, isMoveRight, mouseX} from './userEvents';

export default function (
  prevBulletsStates: GameState<Bullet[]>,
  prevEnemiesStates: GameState<Enemy[]>,
  prevGameStates: GameState<GameStateData>,
  lastGameState: GameStateData,
  prevGameState: GameStateData,
  els: Els,
  xShip: THREE.Mesh,
  sphereBg: THREE.Mesh
) {
  if (prevGameState.gameStatus !== lastGameState.gameStatus) {
    clockReset();

    if (els.flashEl) {
      els.flashEl.classList.add('is-active');
    }

    const newGameState = Object.assign({}, lastGameState, {
      gameStatus: GameStatus.autoRewind
    });

    return {
      gameStateData: newGameState
    };
  }

  if (clockGet() > 0.5) {
    const prevBullets = prevBulletsStates.use() as Bullet[];
    const prevEnemies = prevEnemiesStates.use() as Enemy[];
    const prevState = prevGameStates.use();

    if (prevBullets && prevEnemies) {
      prevBullets.forEach(bullet => updateBulletInScene(bullet));
      prevEnemies.forEach(enemy => updateEnemyInScene(enemy));
    }

    if (prevState) {
      if (els.flashEl) {
        els.flashEl.classList.remove('is-active');
      }

      animateSphereBg(sphereBg, 'back');
      moveXShip(xShip, isMoveLeft, isMoveRight, {
        mouseX
      });

      return {};
    } else {
      const gameStateData = Object.assign(prevGameStates.get(), {
        lives: lastGameState.lives,
        gameStatus: GameStatus.game
      });

      return {
        gameStateData,
        enemies: prevEnemiesStates.get(),
        bullets: prevBulletsStates.get()
      };
    }
  }

  return {};
}
