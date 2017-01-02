import * as settings from './settings';
import { isMoveLeft, isMoveRight, isShoot, resetUserEvents } from "./userEvents";
import { scene, camera, renderer } from "./setup";
import {
  addXShip, moveXShip, resetXShip, destroyXShip,
  detectBulletCollisionAgainstXShip
} from "./xShip";
import {
  Bullet, generateBullets, getFreeBulletId, updateBullet,
  detectBulletCollisionAgainstEnemies, updateBulletInScene
} from "./bullets";
import {
  Enemy, generateEnemies, getFreeEnemyId, rebornEnemies,
  updateEnemy, updateEnemyInScene,
  handleEnemyCollision, resetEnemiesAppearanceInScene
} from "./enemies";
import { addSphereBg, animateSphereBg } from "./sphereBg";
import { parsedResults } from "./getAssets";
import { updateScore, updateHiScore } from "./score";
import { blasterSound, hitSound, wooshSound, explosionSound } from "./sounds";

export interface Els {
  scoreEl: Element | null;
  hiScoreEl: Element | null;
  gameOverEl: Element | null;
};

const els: Els = {
  scoreEl: document.querySelector('.js-score'),
  hiScoreEl: document.querySelector('.js-hi-score'),
  gameOverEl: document.querySelector('.js-game-over'),
};

parsedResults.then(assets => {
  enum GameStatus { initial, game, gameOver };

  interface GameState {
    enemies: Enemy[];
    bullets: Bullet[];
    score: number;
    gameStatus: GameStatus;
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

  const gameState: GameState = {
    gameStatus: GameStatus.initial,
    score: settings.DEFAULT_SCORE,
    bullets,
    enemies
  };

  const defaultGameState: GameState = {
    gameStatus: GameStatus.initial,
    score: settings.DEFAULT_SCORE,
    bullets,
    enemies
  };

  updateHiScore(els.hiScoreEl, settings.DEFAULT_SCORE);
  render(gameState, defaultGameState);

  function render(gameState: GameState, defaultGameState: GameState) {
    const newGameState: GameState = Object.assign({}, gameState);
    const { gameStatus, enemies, bullets } = gameState;
    const { gameOverEl, scoreEl, hiScoreEl } = els;

    renderer.render(scene, camera);

    if (gameStatus === GameStatus.initial && gameOverEl) {
      if (isShoot) { newGameState.gameStatus = GameStatus.game; }
      gameOverEl.classList.remove('is-show');

      updateScore(scoreEl, defaultGameState.score);
      resetEnemiesAppearanceInScene(defaultGameState.enemies, scene);
      resetXShip(xShip, settings.XSHIP_Y);

      newGameState.enemies = defaultGameState.enemies;
      newGameState.bullets = defaultGameState.bullets;
      newGameState.score = defaultGameState.score;
    }

    if (gameStatus === GameStatus.gameOver) {
      if (isShoot) {
        newGameState.gameStatus = GameStatus.initial;
      }

      if (gameOverEl) { gameOverEl.classList.add('is-show'); }
      destroyXShip(xShip);

      const freeBulletId = getFreeBulletId(bullets, isShoot);
      const freeEnemyId = getFreeEnemyId(enemies);

      newGameState.bullets = bullets
        .map( bullet => updateBullet(bullet, freeBulletId, xShip.position.x) );

      newGameState.enemies = enemies
        .map( enemy => updateEnemy(enemy, freeEnemyId) );

      newGameState.enemies.forEach( enemy => updateEnemyInScene(enemy, scene) );
      newGameState.bullets.forEach( bullet => updateBulletInScene(bullet, scene) );
    }

    if (gameStatus === GameStatus.game) {
      const enemiesHit: number[] = [];
      const freeBulletId = getFreeBulletId(bullets, isShoot);
      const freeEnemyId = getFreeEnemyId(enemies);

      detectBulletCollisionAgainstXShip(xShip, enemies, scene, {
        collisionCallback: enemy => {
          newGameState.gameStatus = GameStatus.gameOver;
          newGameState.score += enemy.score;
          resetUserEvents();
          enemiesHit.push(enemy.id);
          updateScore(scoreEl, newGameState.score);
          updateHiScore(hiScoreEl, newGameState.score);
        }
      });

      newGameState.bullets = bullets
        .map( bullet => updateBullet(bullet, freeBulletId, xShip.position.x, {
          bulletEmittedCallback: () => {
            blasterSound.seek(0).play();
          }
        }) )
        .map( bullet => detectBulletCollisionAgainstEnemies(bullet, enemies, scene, {
          collisionCallback: enemy => {
            newGameState.score += enemy.score;
            enemiesHit.push(enemy.id);
            updateScore(scoreEl, newGameState.score);
          }
        }) );

      newGameState.enemies = rebornEnemies(enemies)
        .map( enemy => handleEnemyCollision(enemy, enemiesHit, () => {
          hitSound.seek(0).play();
        }) )
        .map( enemy => updateEnemy(enemy, freeEnemyId, {
          gotPastScreenCallback: () => {
            newGameState.gameStatus = GameStatus.gameOver;
            resetUserEvents();
            updateHiScore(hiScoreEl, newGameState.score);
            wooshSound.seek(0).play();
          },
          destroyedCallback: () => {
            explosionSound.seek(0).play();
          }
        }) );

      newGameState.bullets.forEach( bullet => updateBulletInScene(bullet, scene) );
      newGameState.enemies.forEach( enemy => updateEnemyInScene(enemy, scene) );
      moveXShip(xShip, isMoveLeft, isMoveRight);
      animateSphereBg(sphereBg);
    }

    requestAnimationFrame( () => render(newGameState, defaultGameState) );
  }
});
