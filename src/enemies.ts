import * as settings from './settings';
import { range, random } from "lodash";
import { deg } from "./utils";
import * as boundaries from "./boundaries";
import { update } from 'immupdate';

const OFFSCREEN = 9999;
const MIN_REBORN_TIME = 500;
const MAX_REBORN_TIME = 1000;
const MIN_VELOCITY = 0.03;
const MAX_VELOCITY = 0.05;

export interface Enemy {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
  readonly rotation: number;
  readonly isActive: boolean;
  readonly isUsed: boolean;
  readonly isDestroyed: boolean;
  readonly energy: number;
  readonly initialEnergy: number;
  readonly emittedAt?: number;
  readonly level: number;
  readonly sideForce: number;
  readonly velocity: number;
  readonly delay: number;
  readonly score: number;
}

export function generateEnemies (maxNr: number, xTriangle: THREE.Geometry, scene: THREE.Scene) {
  const array = range(maxNr);

  return array.map( (): Enemy => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      opacity: 0,
      transparent: true,
      side: THREE.BackSide
    });
    const xTriangleMaterial = new THREE.MeshPhongMaterial({
      color: 0x78A5EC,
      specular: 0xffffff,
      shading: THREE.FlatShading,
      side: THREE.BackSide,
      opacity: 1,
      transparent: true
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

    return getDefaultEnemy(element.id);
  });
}

export function getFreeEnemyId (enemies?: Enemy[]) {
  const NON_EXISTENT_ID = -1;

  if (!enemies) { return NON_EXISTENT_ID; }

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
      .find( enemy => !enemy.isActive);

    if (freeEnemy) {
      return freeEnemy.id;
    }
  }

  return NON_EXISTENT_ID;
}

export function rebornEnemies (enemies: Enemy[]) {
    if (enemies.every( enemy => enemy.isUsed ) ) {
      return enemies
        .map( enemy => update(enemy, { isUsed: false }) );
    }

    return enemies;
}

function _checkIfEnemyVanished (enemy: Enemy) {
  return enemy.isDestroyed && enemy.opacity <=0;
}

function _getNewEnemyOpacity (enemy: Enemy) {
  if (enemy.energy <= 0) {
    const { opacity } = enemy;

    delete enemy.opacity;
    return opacity - 0.1;
  }

  return enemy.opacity;
}

function _getNewEnemySideforce(enemy: Enemy): number {
  const {leftBoundary, rightBoundary} = boundaries;

  if (enemy.x < leftBoundary || enemy.x > rightBoundary) {
    return enemy.sideForce * -1;
  }

  return enemy.sideForce;
}

export function updateEnemy (enemy: Enemy, freeEnemyId: number, {
  top = settings.TOP,
  bottom = settings.BOTTOM,
  leftBoundary = boundaries.leftBoundary,
  rightBoundary = boundaries.rightBoundary,
  gotPastScreenCallback,
  destroyedCallback
}: {
  top?: number,
  bottom?: number,
  leftBoundary?: number,
  rightBoundary?: number,
  gotPastScreenCallback?: (thisEnemy: Enemy) => void,
  destroyedCallback?: (thisEnemy: Enemy) => void
} = {}) {
  if (enemy.y < bottom) {
    if (gotPastScreenCallback) { gotPastScreenCallback(enemy); }
    return rebuildEnemy(enemy);
  }

  if ( _checkIfEnemyVanished(enemy) ) {
    return rebuildEnemy(enemy);
  }

  if (freeEnemyId === enemy.id) {
    return update(
      enemy,
      {
        x: random(leftBoundary, rightBoundary, true),
        y: top,
        isActive: true,
        emittedAt: Date.now()
      }
    );
  }

  if (enemy.energy <= 0 && !enemy.isDestroyed && destroyedCallback) {
    destroyedCallback(enemy);
  }

  return update(enemy, {
    x: enemy.x + _getNewEnemySideforce(enemy),
    y: enemy.y - enemy.velocity,
    rotation: enemy.rotation + deg(_getNewEnemySideforce(enemy) * 10),
    isDestroyed: enemy.energy <= 0,
    opacity: _getNewEnemyOpacity(enemy),
    sideForce: _getNewEnemySideforce(enemy)
  });
}

export function handleEnemyCollision (
  enemy: Enemy, enemiesHit: number[],
  hitCallback: (thisEnemy: Enemy) => void
) {
  let { energy } = enemy;

  if ( enemiesHit.some( enemyId => enemyId === enemy.id) ) {
    energy -= 1;

    if (hitCallback) {
      hitCallback(enemy);
    }
  }

  return update(enemy, { energy });
}

export function rebuildEnemy (enemy: Enemy): Enemy {
  const minDelay = Math.max(MIN_REBORN_TIME - enemy.level * 10, 300);
  const maxDelay = Math.max(MAX_REBORN_TIME - enemy.level * 10, 500);
  const maxVelocity = Math.min(MAX_VELOCITY + (enemy.level * 2) / 100, 0.1);
  const energy = random(1, 100) > 80 ? Math.min(enemy.level + 1, 3) : 1;
  const velocity = _getVelocity(energy, maxVelocity, enemy.level);
  const sideForce = energy > 1 ? 0 : random(-0.1, 0.1, true);
  const level = enemy.level + 1;
  const defaultEnemy = getDefaultEnemy(enemy.id);

  return update(defaultEnemy, {
    x: OFFSCREEN,
    y: OFFSCREEN,
    opacity: 1,
    rotation: 0,
    isActive: false,
    emittedAt: undefined,
    isUsed: true,
    isDestroyed: false,
    sideForce,
    velocity,
    level,
    delay: random(minDelay, maxDelay),
    initialEnergy: energy,
    energy,
    score: _calculateScore ({
      velocity, sideForce, level,
      initialEnergy: energy
    })
  });
}

export function getDefaultEnemy (id: number): Enemy {
  const DEFAULT_ENERGY = 1;
  const DEFAULT_LEVEL = 1;
  const DEFAULT_SIDE_FORCE = 0;
  const velocity = random(MIN_VELOCITY, MAX_VELOCITY, true);

  return {
    id,
    x: OFFSCREEN,
    y: OFFSCREEN,
    opacity: 1,
    rotation: 0,
    isActive: false,
    isUsed: false,
    isDestroyed: false,
    energy: DEFAULT_ENERGY,
    initialEnergy: DEFAULT_ENERGY,
    level: DEFAULT_LEVEL,
    sideForce: DEFAULT_SIDE_FORCE,
    velocity,
    delay: random(MIN_REBORN_TIME, MAX_REBORN_TIME),
    score: _calculateScore({
      velocity,
      initialEnergy: DEFAULT_ENERGY,
      sideForce: DEFAULT_SIDE_FORCE,
      level: DEFAULT_LEVEL
    })
  };
}

export function updateEnemyInScene (enemy: Enemy, scene: THREE.Scene) {
  const OFFSCREEN = 9999;
  const element = scene.getObjectById(enemy.id) as THREE.Mesh;

  if (enemy.isDestroyed) {
    element.scale.x = random(0.9, 2, true);
    element.scale.y = random(0.9, 2, true);
  } else {
    element.scale.x = 1;
    element.scale.y = 1;
  }

  if (enemy.isActive) {
    element.position.x = enemy.x;
    element.position.y = enemy.y;
    element.rotation.z = enemy.rotation;
    element.children.forEach( (child: THREE.Mesh) => {
      child.material.opacity = enemy.opacity;
    });
    _updateColors(element, enemy);
  } else {
    element.position.y = OFFSCREEN;
  }
}

export function resetEnemiesAppearanceInScene (enemies: Enemy[], scene: THREE.Scene) {
  enemies.forEach( enemy => {
    const element = scene.getObjectById(enemy.id) as THREE.Mesh;
    const material = element.material as THREE.MeshBasicMaterial;
    material.color.setHex(0x2C88D8);
  });
}

function _getVelocity (energy: number, maxVelocity: number, level: number) {
  switch (energy) {
    case 1:
      return random(MIN_VELOCITY + level / 40, maxVelocity, true);
    case 2:
      return random(MIN_VELOCITY, MIN_VELOCITY + 0.01, true);
    case 3:
      return MIN_VELOCITY;
    default:
      return 0;
  }
}

function _updateColors (element: THREE.Mesh, enemy: Enemy) {
  const { energy, velocity } = enemy;

  if (velocity > 0.1) {
    _updateChildrenColor(element, 0xDB3AD0);
  } else {
    _updateChildrenColor(element, 0x78A5EC);
  }

  if (enemy.isDestroyed) {
    _updateChildrenColor(element, 0xFF0000);
  }

  switch (energy) {
    case 3:
      _updateChildrenEmissive(element, 0xB7BBC0);
      break;
    case 2:
      _updateChildrenEmissive(element, 0x73ADCF);
      break;
    default:
      _updateChildrenEmissive(element, 0x000000);
  }
}

function _updateChildrenColor (element: THREE.Mesh, color: number) {
  element.children.forEach( (child: THREE.Mesh) => {
    const material = child.material as THREE.MeshPhongMaterial;
    material.color.setHex(color);
  } );
}

function _updateChildrenEmissive (element: THREE.Mesh, color: number) {
  element.children.forEach( (child: THREE.Mesh) => {
    const material = child.material as THREE.MeshPhongMaterial;
    material.emissive.setHex(color);
  } );
}

function _calculateScore (
  { velocity, sideForce, level, initialEnergy }: {
    velocity: number,
    sideForce: number,
    level: number,
    initialEnergy: number
  }
) {
  const velocityScore = velocity || 1;
  const sideForceScore = sideForce || 1;

  return Math.ceil(level + velocityScore * 10 + sideForceScore * 10 + initialEnergy);
}
