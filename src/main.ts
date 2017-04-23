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
import {isMoveLeft, isMoveRight, mouseX} from './userEvents';
import {ENABLE_STATS, LIVES} from './settings';
import {update} from 'immupdate';
import {clockGet, clockReset, clockUpdate} from './clock';

export interface Els {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
  livesEl: Element | null;
  flashEl: Element | null;
}

export enum GameStatus { initial, game, gameOver, autoRewind }

export interface GameState {
  readonly enemies: Enemy[];
  readonly bullets: Bullet[];
  readonly score: number;
  readonly gameStatus: GameStatus;
  readonly prevGameStatus?: GameStatus;
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
  const stats = new Stats();

  if (ENABLE_STATS) {
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }

  updateHiScore(els.hiScoreEl, settings.DEFAULT_SCORE);
  render(initialGameState);

  function render(gameState: GameState) {
    if (ENABLE_STATS) { stats.begin(); }

    let newGameState: GameState = gameState;
    clockUpdate();
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
      case GameStatus.autoRewind:
        if (gameState.prevGameStatus !== gameState.gameStatus) {
          clockReset();
          if (els.flashEl) {
            els.flashEl.classList.add('is-active');
          }
        }

        if (clockGet() > 0.5) {
          const prevState = prevStates.shift();

          if (prevState) {
            if (els.flashEl) {
              els.flashEl.classList.remove('is-active');
            }

            prevState.enemies.forEach(enemy => updateEnemyInScene(enemy, scene));
            prevState.bullets.forEach(bullet => updateBulletInScene(bullet, scene));

            newGameState = update(prevState, {
              lives: gameState.lives,
              gameStatus: GameStatus.autoRewind
            });

            animateSphereBg(sphereBg, 'back');
            moveXShip(xShip, isMoveLeft, isMoveRight, {
              mouseX
            });
          } else {
            newGameState = update(gameState, {
              lives: gameState.lives,
              gameStatus: GameStatus.game
            });
          }
        }

        break;
      case GameStatus.game:
        if (gameState.prevGameStatus === GameStatus.autoRewind) {
          clockReset();
          if (els.flashEl) {
            els.flashEl.classList.add('is-active');
          }
        }

        if (clockGet() > 0.5) {
          if (els.flashEl) {
            els.flashEl.classList.remove('is-active');
          }

          newGameState = gameScene(gameState, els, xShip, sphereBg);
          prevStates = updatePrevStates(newGameState, prevStates);
        }
    }

    if (ENABLE_STATS) { stats.end(); }

    requestAnimationFrame( () => render(
      update(newGameState, {
        prevGameStatus: gameState.gameStatus
      }))
    );
  }
});
