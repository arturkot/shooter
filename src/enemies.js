import { range, random } from "lodash";

const MIN_REBORN_TIME = 500;
const MAX_REBORN_TIME = 1000;
const MIN_VELOCITY = 0.03;
const MAX_VELOCITY = 0.05;

export function generateEnemies (maxNr, scene) {
  const OFFSCREEN = 9999;
  const enemies = range(maxNr);

  return enemies.map( (nr) => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x2C88D8 });
    const element = new THREE.Mesh(geometry, material);

    element.position.y = OFFSCREEN;
    scene.add(element);

    return {
      id: element.id,
      x: OFFSCREEN,
      y: OFFSCREEN,
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
  enemy, freeEnemyId, top, bottom, leftBoundry, rightBoundry
} = {}) {
  const thisEnemy = Object.assign({}, enemy);

  if (freeEnemyId === thisEnemy.id) {
    thisEnemy.x = random(leftBoundry, rightBoundry, true);
    thisEnemy.y = top;
    thisEnemy.isActive = true;
    thisEnemy.emittedAt = Date.now();
  }

  if (thisEnemy.y < bottom || thisEnemy.energy <= 0) {
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

  return thisEnemy;
}

export function handleEnemyCollision (enemy, enemiesHit) {
  if ( enemiesHit.some( enemyId => enemyId === enemy.id) ) {
    const thisEnemy = Object.assign({}, enemy);
    thisEnemy.energy -= 1;
    return thisEnemy;
  }

  return enemy;
}

export function rebuildEnemy (enemy) {
  const minDelay = Math.max(MIN_REBORN_TIME - enemy.level * 10, 300);
  const maxDelay = Math.max(MAX_REBORN_TIME - enemy.level * 10, 500);
  const maxVelocity = Math.min(MAX_VELOCITY + (enemy.level * 2) / 100, 0.1);
  const energy = random(1, 100) > 80 ? Math.min(enemy.level + 1, 3) : 1;
  const velocity = _getVelocity(energy, maxVelocity);
  const sideForce = energy > 1 ? 0 : random(-0.1, 0.1, true);

  return Object.assign({}, enemy, {
    y: top,
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
  } else {
    element.position.y = OFFSCREEN;
  }
}

export function updateEnemiesAppearanceInScene (enemies, newEnemies, scene) {
  if ( enemies.every( enemy => enemy.isUsed ) ) {
    newEnemies.forEach( newEnemy => {
      const element = scene.getObjectById(newEnemy.id);

      if (newEnemy.energy === 3) {
        element.material.color.setHex(0xB7BBC0);
      } else if (newEnemy.energy === 2) {
        element.material.color.setHex(0x73ADCF);
      } else if (newEnemy.sideForce > 0.05) {
        element.material.color.setHex(0xC922B0);
      } else if (newEnemy.velocity > 0.08) {
        element.material.color.setHex(0xED0D33);
      }
    });
  }
}

function _getVelocity (energy, maxVelocity) {
  switch (energy) {
    case 1:
      return random(MIN_VELOCITY, maxVelocity, true);
    case 2:
      return random(MIN_VELOCITY, MIN_VELOCITY + 0.15, true);
    case 3:
      return MIN_VELOCITY;
  }
}
