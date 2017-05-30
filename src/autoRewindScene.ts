import {clockGet, clockReset} from './clock';
import {GameState, GameStatus} from './gameState';
import {Els, GameStateData} from './main';
import {Enemy, updateEnemyInScene} from './enemies';
import {Bullet, updateBulletInScene} from './bullets';
import {animateSphereBg} from './sphereBg';
import {moveXShip} from './xShip';
import {isMoveLeft, isMoveRight, mouseX} from './userEvents';

export default function (
  bulletsState: GameState<Bullet[]>,
  prevBulletsStates: GameState<Bullet[]>,
  enemiesState: GameState<Enemy[]>,
  prevEnemiesStates: GameState<Enemy[]>,
  gameStatesCache: GameState<GameStateData>,
  prevGameStates: GameState<GameStateData>,
  gameState: GameState<GameStateData>,
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

    const gameStateData = Object.assign(lastGameState, {
      gameStatus: GameStatus.autoRewind
    });

    gameStatesCache.add(gameStateData);
    prevEnemiesStates.align('isDestroyed', true);
    prevEnemiesStates.align('opacity', 0);
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
    } else {
      const gameStateData = Object.assign(prevGameStates.get(), {
        lives: lastGameState.lives,
        gameStatus: GameStatus.game
      }) as GameStateData;


      gameState.add(gameStateData);
      gameStatesCache.add(gameStateData);
      bulletsState.add( prevBulletsStates.get() as Bullet[] );
      enemiesState.add( prevEnemiesStates.get() as Enemy[] );
    }
  }
}
