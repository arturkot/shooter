import { isMoveLeft, isMoveRight, isShoot, resetUserEvents } from "./userEvents";
import { scene, camera, renderer } from "./setup";
import {
  addXShip, moveXShip, resetXShip, destroyXShip,
  detectBulletCollisionAgainstXShip
} from "./xShip";
import {
  generateBullets, getFreeBulletId, updateBullet,
  detectBulletCollisionAgainstEnemies, updateBulletInScene
} from "./bullets";
import {
  generateEnemies, getFreeEnemyId, rebornEnemies,
  updateEnemy, rebuildEnemy, updateEnemyInScene,
  handleEnemyCollision, resetEnemiesAppearanceInScene
} from "./enemies";
import { addSphereBg, animateSphereBg } from "./sphereBg";
import { leftBoundry, rightBoundry, addboundaries } from "./boundaries";
import { parsedResults } from "./getAssets";
import { updateScore, updateHiScore } from "./score";

const INITIAL_STATE = 'splash screen';
const GAME_STATE = 'game loop';
const GAME_OVER_STATE = 'game over';
const DEFAULT_SCORE = 0;
const SPHERE_BG_URL = 'meshes/sphere-bg.json';
const ENEMIES_WAVE = 24;
const MAX_BULLETS = 11;
const BULLET_SPEED = 0.3;
const XSHIP_Y = -6;
const TOP = 8;
const BOTTOM = -8;
const MAX_BULLETS_ON_SCREEN = 10;

const scoreEl = document.querySelector('.js-score');
const hiScoreEl = document.querySelector('.js-hi-score');
const gameOverEl = document.querySelector('.js-game-over');

parsedResults.then(assets => {
  const {
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk, sphereBgGeo
  } = assets;

  const xShip = addXShip({
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk, scene,
    y: XSHIP_Y
  });

  const defaultAmmo = generateBullets(MAX_BULLETS, scene);
  const defaultEnemies = generateEnemies(ENEMIES_WAVE, xTriangle, scene);
  const sphereBg = addSphereBg(sphereBgGeo, scene);

  updateHiScore({ hiScoreEl, DEFAULT_SCORE });

  render(scene, camera, {
    xShip, sphereBg, defaultAmmo,
    defaultEnemies,
    state: INITIAL_STATE,
    score: DEFAULT_SCORE,
    ammo: defaultAmmo,
    enemies: defaultEnemies
  });
});

function render(scene, camera, {
  enemies, sphereBg, ammo, xShip,
  defaultEnemies, defaultAmmo, score,
  state, enemiesHit = []
} = {}) {
  renderer.render(scene, camera);

  if (state === INITIAL_STATE) {
    if (isShoot) {
      state = GAME_STATE;
    }

    updateScore(scoreEl, score);
    resetEnemiesAppearanceInScene(defaultEnemies, scene);
    resetXShip(xShip, XSHIP_Y);
    gameOverEl.classList.remove('is-show');

    return requestAnimationFrame( () => {
      render(scene, camera, {
        xShip, sphereBg, defaultAmmo,
        defaultEnemies, state,
        score: DEFAULT_SCORE,
        ammo: defaultAmmo,
        enemies: defaultEnemies
      });
    });
  }

  if (state === GAME_OVER_STATE) {
    if (isShoot) {
      state = INITIAL_STATE;
    }

    gameOverEl.classList.add('is-show');
    destroyXShip(xShip);

    const freeBulletId = getFreeBulletId(ammo, isShoot);
    const freeEnemyId = getFreeEnemyId(enemies);

    const newAmmo = ammo
      .map( bullet => updateBullet({
        bullet, enemies, freeBulletId,
        x: xShip.position.x,
        defaultY: XSHIP_Y,
        bulletSpeed: BULLET_SPEED,
        maxBulletsOnScreen: MAX_BULLETS_ON_SCREEN
      }) );

    const newEnemies = enemies
      .map( enemy => updateEnemy({
        enemy, freeEnemyId, leftBoundry, rightBoundry,
        top: TOP,
        bottom: BOTTOM,
        gotPastScreenCallback: () => {
          resetUserEvents();
          state = GAME_OVER_STATE;
          updateHiScore({ hiScoreEl, score });
        }
      }) );

    newEnemies.forEach( enemy => updateEnemyInScene(enemy, scene) );
    newAmmo.forEach( bullet => updateBulletInScene(bullet, scene) );

    return requestAnimationFrame( () => {
      render(scene, camera, {
        xShip, sphereBg, defaultAmmo,
        defaultEnemies, state,
        score: DEFAULT_SCORE,
        ammo: newAmmo,
        enemies: newEnemies
      });
    });
  }

  if (state === GAME_STATE) {
    const freeBulletId = getFreeBulletId(ammo, isShoot);
    const freeEnemyId = getFreeEnemyId(enemies);

    detectBulletCollisionAgainstXShip({
      xShip, enemies, scene,
      collisionCallback: enemy => {
        resetUserEvents();
        state = GAME_OVER_STATE;
        enemiesHit.push(enemy.id);
        updateScore(scoreEl, score += enemy.score);
        updateHiScore({ hiScoreEl, score });
      }
    });

    const newAmmo = ammo
      .map( bullet => updateBullet({
        bullet, enemies, freeBulletId,
        x: xShip.position.x,
        defaultY: XSHIP_Y,
        bulletSpeed: BULLET_SPEED,
        maxBulletsOnScreen: MAX_BULLETS_ON_SCREEN
      }) )
      .map( bullet => detectBulletCollisionAgainstEnemies({
        bullet, enemies, scene,
        collisionCallback: enemy => {
          enemiesHit.push(enemy.id);
          updateScore(scoreEl, score += enemy.score);
        }
      }) );

    const newEnemies = rebornEnemies(enemies)
      .map( enemy => handleEnemyCollision(enemy, enemiesHit) )
      .map( enemy => updateEnemy({
        enemy, freeEnemyId, leftBoundry, rightBoundry,
        top: TOP,
        bottom: BOTTOM,
        gotPastScreenCallback: () => {
          resetUserEvents();
          state = GAME_OVER_STATE;
          updateHiScore({ hiScoreEl, score });
        }
      }) );

    newAmmo.forEach( bullet => updateBulletInScene(bullet, scene) );
    newEnemies.forEach( enemy => updateEnemyInScene(enemy, scene) );
    moveXShip({ xShip, isMoveLeft, isMoveRight, leftBoundry, rightBoundry });
    animateSphereBg(sphereBg);

    requestAnimationFrame(
      render.bind(null, scene, camera, {
        xShip, sphereBg, defaultAmmo,
        defaultEnemies, score, state,
        enemies: newEnemies,
        ammo: newAmmo
      })
    );
  }
}



