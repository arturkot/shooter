import { isMoveLeft, isMoveRight, isShoot } from "./userEvents";
import { scene, camera, renderer } from "./setup";
import { addXShip, moveXShip } from "./xShip";
import { generateBullets, emitBullet, updateBullets } from "./bullets";
import { generateEnemies, emitEnemy, updateEnemies, rebuildEnemy } from "./enemies";
import addBoundries from "./boundries";

const enemies = generateEnemies(30, scene);
const ammo = generateBullets(11, scene);
const xShip = addXShip(scene);

addBoundries(scene);
render(scene, camera);

function render(scene, camera) {
	requestAnimationFrame(render.bind(null, scene, camera));
	renderer.render(scene, camera);

  moveXShip(xShip, isMoveLeft, isMoveRight);
  emitBullet(ammo, xShip, isShoot);
  updateBullets(ammo, enemies, rebuildEnemy);
  emitEnemy(enemies);
  updateEnemies(enemies);
}


