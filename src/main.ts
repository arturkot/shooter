import {addXShip} from './render/xShip';
import {Bullet, generateBullets} from './bullets';
import {Enemy, generateEnemies} from './enemies';
import {addSphereBg} from './render/sphereBg';
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
import {updateRender} from './render';
import {addBullets} from './render/bullets';
import {addEnemies} from './render/enemies';

export interface Els {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
  livesEl: Element | null;
  flashEl: Element | null;
  lastScoreEl: Element | null;
  scoreMultiplierEl: Element | null;
  bonusBarEl: Element | null;
}

export interface GameStateData {
  score: number;
  scoreMultiplier: number;
  scoreChunk: number;
  gameStatus: GameStatus;
  lives: number;
}

export interface XShipStateData {
  positionX: number;
  positionY: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  opacity: number;
}

parsedResults.then(assets => {
  const els: Els = {
    scoreEl: document.querySelector('.js-score'),
    hiScoreEl: document.querySelector('.js-hi-score'),
    gameOverEl: document.querySelector('.js-game-over'),
    livesEl: document.querySelector('.js-lives'),
    flashEl: document.querySelector('.js-flash'),
    lastScoreEl: document.querySelector('.js-last-score'),
    scoreMultiplierEl: document.querySelector('.js-score-multiplier'),
    bonusBarEl: document.querySelector('.js-bonus-bar')
  };

  const {
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk, sphereBgGeo
  } = assets;
  const initialBullets = generateBullets(MAX_BULLETS);
  const initialEnemies = generateEnemies(ENEMIES_WAVE);

  addXShip({
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk,
    shipPositionY: XSHIP_Y
  });
  addSphereBg(sphereBgGeo);
  addBullets(initialBullets);
  addEnemies(initialEnemies, xTriangle);

  const initialGameState: GameStateData = {
    gameStatus: GameStatus.initial,
    scoreMultiplier: 0,
    scoreChunk: DEFAULT_SCORE,
    score: DEFAULT_SCORE,
    lives: LIVES
  };
  const initialXShipState: XShipStateData = {
    positionX: 0,
    positionY: XSHIP_Y,
    rotationY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    opacity: 1
  };
  const xShipState = new GameState(1, initialXShipState);
  const bulletsState = new GameState<Bullet[]>(1, initialBullets);
  const prevBulletsStates = new GameState<Bullet[]>(100, initialBullets);
  const enemiesState = new GameState<Enemy[]>(1, initialEnemies);
  const prevEnemiesStates = new GameState<Enemy[]>(100, initialEnemies);
  const gameState = new GameState(1, initialGameState);
  const gameStatesCache = new GameState(2, initialGameState);
  const prevGameStates = new GameState(100, initialGameState);

  updateHiScore(els.hiScoreEl, DEFAULT_SCORE);
  gameLoop(render);

  function render() {
    const lastXShipState = xShipState.get();
    const lastBullets = bulletsState.get();
    const lastEnemies = enemiesState.get();
    const prevGameState = gameStatesCache.get(1);
    const lastGameState = gameState.get();

    clockUpdate();

    switch (lastGameState.gameStatus) {
      case GameStatus.initial: {
        if (prevGameState.gameStatus === GameStatus.gameOver) {
          gameState.reset();
        }

        initialScene(lastGameState, initialEnemies, els);

        xShipState.reset();
        xShipState.add(initialXShipState);

        bulletsState.reset();
        bulletsState.add(initialBullets);

        enemiesState.reset();
        enemiesState.add(initialEnemies);

        gameStatesCache.add(lastGameState);
        break;
      }
      case GameStatus.gameOver: {
        gameOverScene(lastGameState, lastBullets, lastEnemies, els, lastXShipState);
        bulletsState.add(lastBullets);
        enemiesState.add(lastEnemies);
        gameStatesCache.add(lastGameState);
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
          lastXShipState,
        );

        break;
      } case GameStatus.game: {
        gameScene(
          lastBullets,
          lastEnemies,
          lastGameState,
          prevGameState,
          els,
          lastXShipState
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

    updateRender(lastGameState, lastXShipState, lastBullets, lastEnemies);
  }
});
