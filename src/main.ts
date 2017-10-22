import autoRewindScene from './autoRewindScene';
import { generateBullets, IBullet } from './bullets';
import { clockUpdate } from './clock';
import { generateEnemies, IEnemy } from './enemies';
import { updateRender } from './gameLayer';
import { addBullets } from './gameLayer/bullets';
import { addEnemies } from './gameLayer/enemies';
import { addSphereBg } from './gameLayer/sphereBg';
import { addXShip } from './gameLayer/xShip';
import { gameLoop } from './gameLoop';
import gameOverScene from './gameOverScene';
import gameScene from './gameScene';
import { GameState, GameStatus } from './gameState';
import { parsedResults } from './getAssets';
import initialScene from './initialScene';
import { updateHiScore } from './score';
import {
  DEFAULT_SCORE,
  ENEMIES_WAVE,
  LIVES,
  MAX_BULLETS,
  XSHIP_Y,
} from './settings';

export interface IEls {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
  livesEl: Element | null;
  flashEl: Element | null;
  lastScoreEl: Element | null;
  scoreMultiplierEl: Element | null;
  bonusBarEl: Element | null;
}

export interface IGameStateData {
  score: number;
  scoreMultiplier: number;
  scoreChunk: number;
  gameStatus: GameStatus;
  lives: number;
}

export interface IXShipStateData {
  positionX: number;
  positionY: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  opacity: number;
}

parsedResults.then(assets => {
  const els: IEls = {
    scoreEl: document.querySelector('.js-score'),
    hiScoreEl: document.querySelector('.js-hi-score'),
    gameOverEl: document.querySelector('.js-game-over'),
    livesEl: document.querySelector('.js-lives'),
    flashEl: document.querySelector('.js-flash'),
    lastScoreEl: document.querySelector('.js-last-score'),
    scoreMultiplierEl: document.querySelector('.js-score-multiplier'),
    bonusBarEl: document.querySelector('.js-bonus-bar'),
  };

  const { xShip: xShipGeo, xTriangle, sphereBgGeo } = assets;
  const initialBullets = generateBullets(MAX_BULLETS);
  const initialEnemies = generateEnemies(ENEMIES_WAVE);

  addXShip({
    xShipGeo,
    shipPositionY: XSHIP_Y,
  });
  addSphereBg(sphereBgGeo);
  addBullets(initialBullets);
  addEnemies(initialEnemies, xTriangle);

  const initialGameState: IGameStateData = {
    gameStatus: GameStatus.initial,
    scoreMultiplier: 0,
    scoreChunk: DEFAULT_SCORE,
    score: DEFAULT_SCORE,
    lives: LIVES,
  };
  const initialXShipState: IXShipStateData = {
    positionX: 0,
    positionY: XSHIP_Y,
    rotationY: 0,
    scaleX: 0.3,
    scaleY: 0.3,
    scaleZ: 0.06,
    opacity: 1,
  };
  const xShipState = new GameState(1, initialXShipState);
  const bulletsState = new GameState<IBullet[]>(1, initialBullets);
  const prevBulletsStates = new GameState<IBullet[]>(100, initialBullets);
  const enemiesState = new GameState<IEnemy[]>(1, initialEnemies);
  const prevEnemiesStates = new GameState<IEnemy[]>(100, initialEnemies);
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
        gameOverScene(
          lastGameState,
          lastBullets,
          lastEnemies,
          els,
          lastXShipState
        );
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
          lastXShipState
        );

        break;
      }
      case GameStatus.game: {
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
        break;
      }
      default: {
        break;
      }
    }

    updateRender(lastGameState, lastXShipState, lastBullets, lastEnemies);
  }
});
