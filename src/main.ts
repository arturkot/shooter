import * as settings from './settings';
import { scene, camera, renderer } from "./setup";
import { addXShip } from "./xShip";
import { Bullet, generateBullets } from "./bullets";
import { Enemy, generateEnemies } from "./enemies";
import { addSphereBg } from "./sphereBg";
import { parsedResults } from "./getAssets";
import { updateHiScore } from "./score";
import initialScene from './initialScene';
import gameOverScene from './gameOverScene';
import gameScene from './gameScene';

export interface Els {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
};

export enum GameStatus { initial, game, gameOver };

export interface GameState {
  readonly enemies: Enemy[];
  readonly bullets: Bullet[];
  readonly score: number;
  readonly gameStatus: GameStatus;
};

parsedResults.then(assets => {
  const els: Els = {
    scoreEl: document.querySelector('.js-score'),
    hiScoreEl: document.querySelector('.js-hi-score'),
    gameOverEl: document.querySelector('.js-game-over'),
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
    enemies
  };

  updateHiScore(els.hiScoreEl, settings.DEFAULT_SCORE);
  render(initialGameState);

  function render(gameState: GameState) {
    let newGameState: GameState;

    renderer.render(scene, camera);

    switch (gameState.gameStatus) {
      case GameStatus.initial:
        newGameState = initialScene(initialGameState, els, xShip);
        break;
      case GameStatus.gameOver:
        newGameState = gameOverScene(gameState, els, xShip);
        break;
      case GameStatus.game:
        newGameState = gameScene(gameState, els, xShip, sphereBg);
    }

    requestAnimationFrame( () => render(newGameState) );
  }
});
