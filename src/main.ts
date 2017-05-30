import {scene} from './setup';
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
import {DEFAULT_SCORE, ENEMIES_WAVE, LIVES, MAX_BULLETS, XSHIP_Y} from './settings';
import {clockUpdate} from './clock';
import {GameState, GameStatus} from './gameState';
import {gameLoop} from './gameLoop';

export interface Els {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
  livesEl: Element | null;
  flashEl: Element | null;
}

export interface GameStateData {
  score: number;
  gameStatus: GameStatus;
  lives: number;
}

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
  const gameState = new GameState(1, initialGameState);
  const gameStatesCache = new GameState(2, initialGameState);
  const prevGameStates = new GameState(100, initialGameState);

  updateHiScore(els.hiScoreEl, DEFAULT_SCORE);
  gameLoop(render);

  function render() {
    const lastBullets = bulletsState.get() as Bullet[];
    const lastEnemies = enemiesState.get() as Enemy[];
    const prevGameState = gameStatesCache.get(1) as GameStateData;
    const lastGameState = gameState.get() as GameStateData;

    clockUpdate();

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
        gameStatesCache.add(gameStateData);
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
        gameStatesCache.add(gameStateData);
        break;
      }
      case GameStatus.autoRewind: {
        autoRewindScene(
          bulletsState,
          prevBulletsStates,
          enemiesState,
          prevEnemiesStates,
          gameStatesCache,
          prevGameStates,
          gameState,
          lastGameState,
          prevGameState,
          els,
          xShip,
          sphereBg
        );

        break;
      } case GameStatus.game: {
        gameScene(
          lastBullets,
          lastEnemies,
          lastGameState,
          prevGameState,
          els,
          xShip,
          sphereBg
        );

        if (lastGameState) {
          bulletsState.add(lastBullets);
          prevBulletsStates.add(lastBullets);

          enemiesState.add(lastEnemies);
          prevEnemiesStates.add(lastEnemies);

          gameStatesCache.add(lastGameState);
          prevGameStates.add(lastGameState);
        }
      }
    }
  }
});
