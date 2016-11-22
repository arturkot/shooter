import { range, random } from "lodash";
import { deg } from "./utils";

const MIN_REBORN_TIME = 500;
const MAX_REBORN_TIME = 1000;
const MIN_VELOCITY = 0.03;
const MAX_VELOCITY = 0.05;

export function generateEnemies (maxNr, xTriangle, scene) {
  const OFFSCREEN = 9999;
  const enemies = range(maxNr);

  return enemies.map( (nr) => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      opacity: 0,
      transparent: true
    });
    const xTriangleMaterial = new THREE.MeshPhongMaterial({
      color: 0x78A5EC,
      specular: 0xffffff,
      shading: THREE.FlatShading,
      side: THREE.BackSide
    });
    const triangleA = new THREE.Mesh(xTriangle, xTriangleMaterial);
    const triangleB = new THREE.Mesh(xTriangle, xTriangleMaterial);
    const element = new THREE.Mesh(geometry, material);

    triangleA.position.x = -0.2;
    triangleA.rotation.x = deg(90);
    triangleA.rotation.y = deg(-90);
    triangleA.scale.x = 2.4;
    triangleA.scale.z = 2.4;

    triangleB.position.x = 0.2;
    triangleB.rotation.x = deg(90);
    triangleB.rotation.y = deg(-270);
    triangleB.scale.x = 2.4;
    triangleB.scale.z = 2.4;

    element.position.y = OFFSCREEN;
    scene.add(element);
    element.add(triangleA);
    element.add(triangleB);

    return {
      id: element.id,
      x: OFFSCREEN,
      y: OFFSCREEN,
      rotation: 0,
      isActive: false,
      isUsed: false,
      energy: 1,
      emittedAt: undefined,
      level: 1,
      sideForce: 0,
      velocity: random(MIN_VELOCITY, MAX_VELOCITY, true),
      delay: random(MIN_REBORN_TIME, MAX_REBORN_TIME)
    };
  });
}

export function getFreeEnemyId (enemies) {
  const lastEnemy = enemies
    .filter( enemy => enemy.isActive )
    .sort( (enemyA, enemyB) => enemyB.emittedAt - enemyA.emittedAt)
    [0];

  if (
    !lastEnemy ||
    Date.now() - lastEnemy.emittedAt > lastEnemy.delay
  ) {
    const freeEnemy = enemies
      .filter( enemy => !enemy.isUsed)
      .find( enemy => !enemy.isActive) || {};

    return freeEnemy.id;
  }
}

export function rebornEnemies (enemies) {
    if (enemies.every( enemy => enemy.isUsed ) ) {
      return enemies
        .map( enemy => Object.assign({}, enemy, { isUsed: false }) );
    }

    return enemies;
}

export function updateEnemy ({
  enemy, freeEnemyId, top, bottom, leftBoundry, rightBoundry,
  gotPastScreenCallback
} = {}) {
  const thisEnemy = Object.assign({}, enemy);

  if (freeEnemyId === thisEnemy.id) {
    thisEnemy.x = random(leftBoundry, rightBoundry, true);
    thisEnemy.y = top;
    thisEnemy.isActive = true;
    thisEnemy.emittedAt = Date.now();
  }

  if (thisEnemy.y < bottom) {
    if (gotPastScreenCallback) { gotPastScreenCallback(); }
    return rebuildEnemy(thisEnemy);
  }

  if (thisEnemy.energy <= 0) {
    return rebuildEnemy(thisEnemy);
  }

  if (
    thisEnemy.x < leftBoundry ||
    thisEnemy.x > rightBoundry
  ) {
    thisEnemy.sideForce *= -1;
  }

  thisEnemy.x += thisEnemy.sideForce;
  thisEnemy.y -= thisEnemy.velocity;
  thisEnemy.rotation += deg(thisEnemy.sideForce * 10);

  return thisEnemy;
}

export function handleEnemyCollision (enemy, enemiesHit) {
  const thisEnemy = Object.assign({}, enemy);

  if ( enemiesHit.some( enemyId => enemyId === enemy.id) ) {
    thisEnemy.energy -= 1;
  }

  return thisEnemy;
}

export function rebuildEnemy (enemy) {
  const minDelay = Math.max(MIN_REBORN_TIME - enemy.level * 10, 300);
  const maxDelay = Math.max(MAX_REBORN_TIME - enemy.level * 10, 500);
  const maxVelocity = Math.min(MAX_VELOCITY + (enemy.level * 2) / 100, 0.1);
  const energy = random(1, 100) > 80 ? Math.min(enemy.level + 1, 3) : 1;
  const velocity = _getVelocity(energy, maxVelocity, enemy.level);
  const sideForce = energy > 1 ? 0 : random(-0.1, 0.1, true);

  return Object.assign({}, enemy, {
    y: top,
    rotation: 0,
    isActive: false,
    emittedAt: undefined,
    isUsed: true,
    sideForce,
    velocity,
    level: enemy.level + 1,
    delay: random(minDelay, maxDelay),
    energy
  });
}

export function updateEnemyInScene (enemy, scene) {
  const OFFSCREEN = 9999;
  const element = scene.getObjectById(enemy.id);

  if (enemy.isActive) {
    element.position.x = enemy.x;
    element.position.y = enemy.y;
    element.rotation.z = enemy.rotation;
    _updateColor(element, enemy);
  } else {
    element.position.y = OFFSCREEN;
  }
}

export function updateEnemiesAppearanceInScene (enemies, newEnemies, scene) {
  if ( enemies.every( enemy => enemy.isUsed ) ) {
    newEnemies.forEach( newEnemy => {
      const element = scene.getObjectById(newEnemy.id);
      _updateColor(element, newEnemy);
    });
  }
}

export function resetEnemiesAppearanceInScene (enemies, scene) {
  enemies.forEach( enemy => {
    const element = scene.getObjectById(enemy.id);
    element.material.color.setHex(0x2C88D8);
  });
}

function _getVelocity (energy, maxVelocity, level) {
  switch (energy) {
    case 1:
      return random(MIN_VELOCITY + level / 40, maxVelocity, true);
    case 2:
      return random(MIN_VELOCITY, MIN_VELOCITY + 0.01, true);
    case 3:
      return MIN_VELOCITY;
  }
}

function _updateColor (element, enemy) {
  const { energy, velocity } = enemy;

  if (velocity > 0.1) {
    element.children.forEach( child => child.material.color.setHex(0xDB3AD0) );
  } else {
    element.children.forEach( child => child.material.color.setHex(0x78A5EC) );
  }

  switch (energy) {
    case 3:
      element.children.forEach( child => child.material.emissive.setHex(0xB7BBC0) );
      break;
    case 2:
      element.children.forEach( child => child.material.emissive.setHex(0x73ADCF) );
      break;
    default:
      element.children.forEach( child => child.material.emissive.setHex(0x000000) );
  }
}
