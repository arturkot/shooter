import {camera, renderer, scene} from './setup';
import {addXShip} from './xShip';
import {generateBullets} from './bullets';
import {generateEnemies} from './enemies';
import {addSphereBg} from './sphereBg';
import {parsedResults} from './getAssets';
import {updateHiScore} from './score';
import initialScene from './initialScene';
import gameOverScene from './gameOverScene';
import autoRewindScene from './autoRewindScene';
import gameScene from './gameScene';
import {ENABLE_STATS, DEFAULT_SCORE, ENEMIES_WAVE, LIVES, MAX_BULLETS, XSHIP_Y} from './settings';
import {clockUpdate} from './clock';
import {GameState, GameStateData, GameStatus} from './gameState';

export interface Els {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
  livesEl: Element | null;
  flashEl: Element | null;
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

  const bullets = generateBullets(MAX_BULLETS, scene);
  const enemies = generateEnemies(ENEMIES_WAVE, xTriangle, scene);
  const sphereBg = addSphereBg(sphereBgGeo, scene);
  const initialGameState: GameStateData = {
    gameStatus: GameStatus.initial,
    score: DEFAULT_SCORE,
    bullets,
    enemies,
    lives: LIVES
  };
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
    if (ENABLE_STATS) { stats.begin(); }

    const prevGameState = gameState.get(1);
    const lastGameState = gameState.get();
    let newGameState: GameStateData;

    clockUpdate();
    renderer.render(scene, camera);

    switch (lastGameState.gameStatus) {
      case GameStatus.initial:
        newGameState = initialScene(initialGameState, els, xShip);
        gameState.reset();
        gameState.add(newGameState);
        break;
      case GameStatus.gameOver:
        gameState.reset();
        newGameState = gameOverScene(lastGameState, els, xShip);
        gameState.add(newGameState);
        break;
      case GameStatus.autoRewind:
        newGameState = autoRewindScene(
          prevGameStates,
          lastGameState,
          prevGameState,
          els,
          xShip,
          sphereBg
        ) as GameStateData;

        if (newGameState) {
          gameState.add(newGameState);
        }

        break;
      case GameStatus.game:
        newGameState = gameScene(
          lastGameState,
          prevGameState,
          els,
          xShip,
          sphereBg
        ) as GameStateData;

        if (newGameState) {
          gameState.add(newGameState);
          prevGameStates.add(newGameState);
        }
    }

    if (ENABLE_STATS) { stats.end(); }

    requestAnimationFrame(render);
  }
});
