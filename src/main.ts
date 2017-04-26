import {camera, renderer, scene} from './setup';
import {addXShip} from './xShip';
import {Bullet, generateBullets} from './bullets';
import {Enemy, generateEnemies} from './enemies';
import {addSphereBg} from './sphereBg';
import {parsedResults} from './getAssets';
import {updateHiScore} from './score';
import initialScene from './initialScene';
import gameOverScene from './gameOverScene';
import autoRewindScene from './autoRewindScene';
import gameScene from './gameScene';
import {DEFAULT_SCORE, ENABLE_STATS, ENEMIES_WAVE, LIVES, MAX_BULLETS, XSHIP_Y} from './settings';
import {clockUpdate} from './clock';
import {GameState, GameStatus} from './gameState';

export interface Els {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
  livesEl: Element | null;
  flashEl: Element | null;
}

export interface GameStateData {
  readonly score: number;
  readonly gameStatus: GameStatus;
  readonly lives: number;
}

// let prevStates: GameStateData[] = [];

// function updatePrevStates (state: GameState, prevStates: GameState[]) {
//   const MAX_LENGTH = 100;
//
//   prevStates.unshift(state);
//   return prevStates.slice(0, MAX_LENGTH + 1).map( prevState => {
//     const currentEnemies = state.enemies;
//     const enemies = prevState.enemies.map((enemy, index) => {
//       if (currentEnemies[index].isDestroyed) {
//         return update(enemy, {
//           isDestroyed: true,
//           opacity: 0
//         });
//       }
//
//       return enemy;
//     });
//
//     return update(prevState, { enemies });
//   });
// }

parsedResults.then(assets => {
  const els: Els = {
    scoreEl: document.querySelector('.js-score'),
    hiScoreEl: document.querySelector('.js-hi-score'),
    gameOverEl: document.querySelector('.js-game-over'),
    livesEl: document.querySelector('.js-lives'),
    flashEl: document.querySelector('.js-flash')
  };

  const {
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk, sphereBgGeo
  } = assets;

  const xShip = addXShip({
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk, scene,
    shipPositionY: XSHIP_Y
  });

  const initialBullets = generateBullets(MAX_BULLETS, scene);
  const initialEnemies = generateEnemies(ENEMIES_WAVE, xTriangle, scene);
  const sphereBg = addSphereBg(sphereBgGeo, scene);
  const initialGameState: GameStateData = {
    gameStatus: GameStatus.initial,
    score: DEFAULT_SCORE,
    lives: LIVES
  };
  const bulletsState = new GameState(1, initialBullets);
  const prevBulletsStates = new GameState(100, initialBullets);
  const enemiesState = new GameState(1, initialEnemies);
  const prevEnemiesStates = new GameState(100, initialEnemies);
  const gameState = new GameState(2, initialGameState);
  const prevGameStates = new GameState(100, initialGameState);
  const stats = new Stats();

  if (ENABLE_STATS) {
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }

  updateHiScore(els.hiScoreEl, DEFAULT_SCORE);
  render();

  function render() {
    requestAnimationFrame(render);

    if (ENABLE_STATS) { stats.begin(); }

    const lastBullets = bulletsState.get();
    const lastEnemies = enemiesState.get();
    const prevGameState = gameState.get(1);
    const lastGameState = gameState.get();

    clockUpdate();
    renderer.render(scene, camera);

    switch (lastGameState.gameStatus) {
      case GameStatus.initial: {
        const {
          gameStateData,
          bullets,
          enemies
        } = initialScene(initialGameState, initialBullets, initialEnemies, els, xShip);

        bulletsState.reset();
        bulletsState.add(bullets);

        enemiesState.reset();
        enemiesState.add(enemies);

        gameState.reset();
        gameState.add(gameStateData);

        break;
      }
      case GameStatus.gameOver: {
        gameState.reset();
        const {
          gameStateData,
          bullets,
          enemies
        } = gameOverScene(lastGameState, lastBullets, lastEnemies, els, xShip);
        bulletsState.add(bullets);
        enemiesState.add(enemies);
        gameState.add(gameStateData);
        break;
      }
      case GameStatus.autoRewind: {
        const {
          gameStateData,
          bullets,
          enemies
        } = autoRewindScene(
            prevBulletsStates,
            prevEnemiesStates,
            prevGameStates,
            lastGameState,
            prevGameState,
            els,
            xShip,
            sphereBg
        ) as {
          gameStateData: GameStateData,
          bullets: Bullet[],
          enemies: Enemy[],
        };

        if (gameStateData) {
          gameState.add(gameStateData);
        }

        if (bullets && enemies) {
          bulletsState.add(bullets);
          enemiesState.add(enemies);
        }

        break;
      } case GameStatus.game: {
        const {
          gameStateData,
          enemies,
          bullets
        } = gameScene(
          lastBullets,
          lastEnemies,
          lastGameState,
          prevGameState,
          els,
          xShip,
          sphereBg
        ) as {
          gameStateData: GameStateData,
          bullets: Bullet[],
          enemies: Enemy[],
        };

        if (gameStateData) {
          bulletsState.add(bullets);
          prevBulletsStates.add((bullets));

          enemiesState.add(enemies);
          prevEnemiesStates.add(enemies);

          gameState.add(gameStateData);
          prevGameStates.add(gameStateData);
        }
      }
    }

    if (ENABLE_STATS) { stats.end(); }
  }
});
