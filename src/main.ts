import * as settings from './settings';
import { scene, camera, renderer } from "./setup";
import {addXShip, moveXShip} from "./xShip";
import {Bullet, generateBullets, updateBulletInScene} from "./bullets";
import {Enemy, generateEnemies, updateEnemyInScene} from "./enemies";
import {addSphereBg, animateSphereBg} from "./sphereBg";
import { parsedResults } from "./getAssets";
import { updateHiScore } from "./score";
import initialScene from './initialScene';
import gameOverScene from './gameOverScene';
import gameScene from './gameScene';
import {isMoveLeft, isMoveRight, isRewind} from './userEvents';
import {LIVES} from './settings';
import {update} from 'immupdate';

export interface Els {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
  rewindEl: HTMLInputElement | null;
  livesEl: Element | null;
}

export enum GameStatus { initial, game, gameOver, rewind, autoRewind }

export interface GameState {
  readonly enemies: Enemy[];
  readonly bullets: Bullet[];
  readonly score: number;
  readonly gameStatus: GameStatus;
  readonly lives: number;
}

let prevStates: GameState[] = [];

function updatePrevStates (state: GameState, prevStates: GameState[]) {
  const MAX_LENGTH = 100;

  prevStates.unshift(state);
  return prevStates.slice(0, MAX_LENGTH + 1).map( prevState => {
    const currentEnemies = state.enemies;
    const enemies = prevState.enemies.map((enemy, index) => {
      if (currentEnemies[index].isDestroyed) {
        return update(enemy, {
          isDestroyed: true,
          opacity: 0
        });
      }

      return enemy;
    });

    return update(prevState, { enemies });
  });
}

parsedResults.then(assets => {
  const els: Els = {
    scoreEl: document.querySelector('.js-score'),
    hiScoreEl: document.querySelector('.js-hi-score'),
    gameOverEl: document.querySelector('.js-game-over'),
    rewindEl: document.querySelector('.js-rewind') as HTMLInputElement,
    livesEl: document.querySelector('.js-lives')
  };

  const {
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk, sphereBgGeo
  } = assets;

  const xShip = addXShip({
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk, scene,
    shipPositionY: settings.XSHIP_Y
  });

  const bullets = generateBullets(settings.MAX_BULLETS, scene);
  const enemies = generateEnemies(settings.ENEMIES_WAVE, xTriangle, scene);
  const sphereBg = addSphereBg(sphereBgGeo, scene);

  const initialGameState: GameState = {
    gameStatus: GameStatus.initial,
    score: settings.DEFAULT_SCORE,
    bullets,
    enemies,
    lives: LIVES
  };

  updateHiScore(els.hiScoreEl, settings.DEFAULT_SCORE);
  render(initialGameState);

  function render(gameState: GameState) {
    let newGameState: GameState = gameState;

    renderer.render(scene, camera);

    switch (gameState.gameStatus) {
      case GameStatus.initial:
        prevStates = [];
        newGameState = initialScene(initialGameState, els, xShip);
        break;
      case GameStatus.gameOver:
        prevStates = [];
        newGameState = gameOverScene(gameState, els, xShip);
        break;
      case GameStatus.rewind:
        if (!isRewind) {
          newGameState = update(gameState, {
            gameStatus: GameStatus.game
          });
        } else {
          let rangeValue = 0;
          if (els.rewindEl) {
            rangeValue = parseInt(els.rewindEl.value, 10);
          }
          const calculatedStateIndex = Math.floor(prevStates.length * rangeValue / 100) - 1;
          const prevStateIndex = calculatedStateIndex >= 0 ? calculatedStateIndex : 0;
          const prevState = prevStates[prevStateIndex];

          moveXShip(xShip, isMoveLeft, isMoveRight);
          prevState.enemies.forEach( enemy => updateEnemyInScene(enemy, scene) );

          newGameState = update(prevStates[prevStateIndex], {
            gameStatus: GameStatus.rewind
          });
        }
        break;
      case GameStatus.autoRewind:
        const prevState = prevStates.shift();

        if (prevState) {
          prevState.enemies.forEach( enemy => updateEnemyInScene(enemy, scene) );
          prevState.bullets.forEach( bullet => updateBulletInScene(bullet, scene) );

          newGameState = update(prevState, {
            lives: gameState.lives,
            gameStatus: GameStatus.autoRewind
          });
        } else {
          newGameState = update(gameState, {
            lives: gameState.lives,
            gameStatus: GameStatus.game
          });
        }

        animateSphereBg(sphereBg, 'back');
        moveXShip(xShip, isMoveLeft, isMoveRight);

        break;
      case GameStatus.game:
        newGameState = gameScene(gameState, els, xShip, sphereBg);
        prevStates = updatePrevStates(newGameState, prevStates);
    }

    requestAnimationFrame( () => render(newGameState) );
  }
});
