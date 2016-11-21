import { range, random } from "lodash";
import { leftBoundry, rightBoundry } from "./boundries";

const MIN_REBORN_TIME = 500;
const MAX_REBORN_TIME = 1000;
const MIN_VELOCITY = 0.03;
const MAX_VELOCITY = 0.05;

export function generateEnemies (maxNr, scene) {
  const OFFSCREEN_Y = 9999;
  const enemies = range(maxNr);

  return enemies.map( (nr) => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x2C88D8 });
    const element = new THREE.Mesh(geometry, material);

    element.position.y = OFFSCREEN_Y;
    scene.add(element);

    return {
      element,
      box3: new THREE.Box3().setFromObject(element),
      isActive: false,
      isUsed: false,
      emittedAt: undefined,
      level: 1,
      sideForce: 0,
      velocity: random(MIN_VELOCITY, MAX_VELOCITY, true),
      delay: random(MIN_REBORN_TIME, MAX_REBORN_TIME)
    };
  });
}

export function emitEnemy (enemies) {
  const lastEnemy = enemies
    .filter( enemy => enemy.isActive )
    .sort( (enemyA, enemyB) => enemyB.emittedAt - enemyA.emittedAt)
    [0];

  if (
    !lastEnemy ||
    Date.now() - lastEnemy.emittedAt > lastEnemy.delay
  ) {
    if (enemies.every( enemy => enemy.isUsed ) ) {
      enemies.map( enemy => enemy.isUsed = false );
    }

    const freeEnemy = enemies
      .filter( enemy => !enemy.isUsed)
      .find( enemy => !enemy.isActive);

    if (!freeEnemy) { return; }

    const { element } = freeEnemy;

    element.position.x = random(leftBoundry, rightBoundry, true);
    element.position.y = 8;
    freeEnemy.isActive = true;
    freeEnemy.emittedAt = Date.now();
  }
}

export function updateEnemies (enemies) {
  const activeEnemies = enemies.filter( enemy => enemy.isActive);
  activeEnemies.forEach(updateActiveEnemy);
}

export function updateActiveEnemy (enemy) {
  if (enemy.element.position.y < -8) {
    return rebuildEnemy(enemy);
  }

  if (
    enemy.element.position.x < leftBoundry ||
    enemy.element.position.x > rightBoundry
  ) {
    enemy.sideForce *= -1;
  }

  enemy.element.position.x += enemy.sideForce;
  enemy.element.position.y -= enemy.velocity;

  return enemy;
}

export function rebuildEnemy (enemy) {
  const minDelay = Math.max(MIN_REBORN_TIME - enemy.level * 10, 300);
  const maxDelay = Math.max(MAX_REBORN_TIME - enemy.level * 10, 500);
  const maxVelocity = Math.min(MAX_VELOCITY + (enemy.level * 2) / 100, 0.1);

  enemy.element.position.y = 8;
  enemy.box3 = new THREE.Box3().setFromObject(enemy.element);
  enemy.isActive = false;
  enemy.emittedAt = undefined;
  enemy.isUsed = true;
  enemy.sideForce = random(enemy.level / -1000, enemy.level / 1000, true);
  enemy.velocity = random(MIN_VELOCITY, maxVelocity, true);
  enemy.level += 1;
  enemy.delay = random(minDelay, maxDelay);
}
