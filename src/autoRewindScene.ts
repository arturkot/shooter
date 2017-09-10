import {clockGet, clockReset} from './clock';
import {GameState, GameStatus} from './gameState';
import {Els, GameStateData, XShipStateData} from './main';
import {Enemy, updateEnemyInScene} from './enemies';
import {Bullet} from './bullets';
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
  lastXShipState: XShipStateData,
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
    const prevEnemies = prevEnemiesStates.use() as Enemy[];
    const prevState = prevGameStates.use();

    if (prevEnemies) {
      prevEnemies.forEach(enemy => updateEnemyInScene(enemy));
    }

    if (prevState) {
      if (els.flashEl) {
        els.flashEl.classList.remove('is-active');
      }

      moveXShip(lastXShipState, isMoveLeft, isMoveRight, {
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
