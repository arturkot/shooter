import { isMoveLeft, isMoveRight, isShoot } from "./userEvents";
import { scene, camera, renderer } from "./setup";
import { addXShip, moveXShip } from "./xShip";
import {
  generateBullets, getFreeBulletId, updateBullet,
  detectBulletCollisionAgainstEnemies, updateBulletInScene
} from "./bullets";
import {
  generateEnemies, getFreeEnemyId, rebornEnemies,
  updateEnemy, rebuildEnemy, updateEnemyInScene,
  handleEnemyCollision, updateEnemiesAppearanceInScene,
  resetEnemiesAppearanceInScene
} from "./enemies";
import { addSphereBg, animateSphereBg } from "./sphereBg";
import { leftBoundry, rightBoundry, addboundaries } from "./boundaries";
import { parsedResults } from "./getAssets";

const SPHERE_BG_URL = 'meshes/sphere-bg.json';
const ENEMIES_WAVE = 24;
const MAX_BULLETS = 11;
const BULLET_SPEED = 0.3;
const XSHIP_Y = -6;
const TOP = 8;
const BOTTOM = -8;
const MAX_BULLETS_ON_SCREEN = 10;

let isStarted = false;

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

  render(scene, camera, {
    xShip, sphereBg, defaultAmmo,
    defaultEnemies,
    ammo: defaultAmmo,
    enemies: defaultEnemies
  });
});

function render(scene, camera, {
  enemies, sphereBg, ammo, xShip,
  defaultEnemies, defaultAmmo
} = {}) {
  renderer.render(scene, camera);

  if (!isStarted) {
    if (isShoot) {
      isStarted = true;
    }

    resetEnemiesAppearanceInScene(defaultEnemies, scene);

    return requestAnimationFrame( () => {
      render(scene, camera, {
        xShip, sphereBg, defaultAmmo,
        defaultEnemies,
        ammo: defaultAmmo,
        enemies: defaultEnemies
      });
    });
  }

  let enemiesHit = [];
  const freeBulletId = getFreeBulletId(ammo, isShoot);
  const freeEnemyId = getFreeEnemyId(enemies);

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
      collisionCallback: enemyId => enemiesHit.push(enemyId)
    }) );

  const newEnemies = rebornEnemies(enemies)
    .map( enemy => handleEnemyCollision(enemy, enemiesHit) )
    .map( enemy => updateEnemy({
      enemy, freeEnemyId, leftBoundry, rightBoundry,
      top: TOP,
      bottom: BOTTOM,
      gotPastScreenCallback: () => isStarted = false
    }) );

  updateEnemiesAppearanceInScene(enemies, newEnemies, scene);
  newAmmo.forEach( bullet => updateBulletInScene(bullet, scene) );
  newEnemies.forEach( enemy => updateEnemyInScene(enemy, scene) );
  moveXShip({ xShip, isMoveLeft, isMoveRight, leftBoundry, rightBoundry });
  animateSphereBg(sphereBg);

	requestAnimationFrame(
    render.bind(null, scene, camera, {
      xShip, sphereBg, defaultAmmo,
      defaultEnemies,
      enemies: newEnemies,
      ammo: newAmmo
    })
  );
}



