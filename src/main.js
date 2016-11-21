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
  handleEnemyCollision, updateEnemiesAppearanceInScene
} from "./enemies";
import { leftBoundry, rightBoundry, addBoundries } from "./boundries";

const ENEMIES_WAVE = 20;
const MAX_BULLETS = 11;
const BULLET_SPEED = 0.3;
const XSHIP_Y = -6;
const TOP = 8;
const BOTTOM = -8;
const MAX_BULLETS_ON_SCREEN = 10;

const enemies = generateEnemies(ENEMIES_WAVE, scene);
const ammo = generateBullets(MAX_BULLETS, scene);
const xShip = addXShip(scene, XSHIP_Y);

addBoundries(scene);
render(scene, camera, {
  enemies, ammo, xShip
});

function render(scene, camera, { enemies, ammo, xShip } = {}) {
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
      bottom: BOTTOM
    }) );

  updateEnemiesAppearanceInScene(enemies, newEnemies, scene);
  newAmmo.forEach( bullet => updateBulletInScene(bullet, scene) );
  newEnemies.forEach( enemy => updateEnemyInScene(enemy, scene) );
  moveXShip(xShip, isMoveLeft, isMoveRight);

  renderer.render(scene, camera);
	requestAnimationFrame(
    render.bind(null, scene, camera, {
      xShip,
      enemies: newEnemies,
      ammo: newAmmo
    })
  );
}



