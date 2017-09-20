import { random } from 'lodash';
import { IEnemy } from '../enemies';
import { deg } from '../utils';
import { scene } from './setup';

export const enemyElements: THREE.Mesh[] = [];

export function addEnemies(initialEnemies: IEnemy[], xTriangle: THREE.Geometry) {
  const OFFSCREEN = 9999;

  initialEnemies.forEach(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      opacity: 0,
      side: THREE.BackSide,
      transparent: true,
    });
    const xTriangleMaterial = new THREE.MeshPhongMaterial({
      color: 0x78a5ec,
      opacity: 1,
      shading: THREE.FlatShading,
      side: THREE.BackSide,
      specular: 0xffffff,
      transparent: true,
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
    enemyElements.push(element);
    element.add(triangleA);
    element.add(triangleB);
  });
}

export function updateEnemyInScene(enemy: IEnemy) {
  const OFFSCREEN = 9999;
  const element = enemyElements[enemy.id];

  if (!element) {
    return;
  }

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
    element.children.forEach((child: THREE.Mesh) => {
      child.material.opacity = enemy.opacity;
    });
    _updateColors(element, enemy);
  } else {
    element.position.y = OFFSCREEN;
  }
}

export function resetEnemiesAppearanceInScene(enemies: IEnemy[]) {
  enemies.forEach(enemy => {
    const element = enemyElements[enemy.id];

    if (!element) {
      return;
    }

    const material = element.material as THREE.MeshBasicMaterial;
    material.color.setHex(0x2c88d8);
  });
}

function _updateColors(element: THREE.Mesh, enemy: IEnemy) {
  const { energy, velocity } = enemy;

  if (velocity > 0.1) {
    _updateChildrenColor(element, 0xdb3ad0);
  } else {
    _updateChildrenColor(element, 0x78a5ec);
  }

  if (enemy.isDestroyed) {
    _updateChildrenColor(element, 0xff0000);
  }

  switch (energy) {
    case 3:
      _updateChildrenEmissive(element, 0xb7bbc0);
      break;
    case 2:
      _updateChildrenEmissive(element, 0x73adcf);
      break;
    default:
      _updateChildrenEmissive(element, 0x000000);
  }
}

function _updateChildrenColor(element: THREE.Mesh, color: number) {
  element.children.forEach((child: THREE.Mesh) => {
    const material = child.material as THREE.MeshPhongMaterial;
    material.color.setHex(color);
  });
}

function _updateChildrenEmissive(element: THREE.Mesh, color: number) {
  element.children.forEach((child: THREE.Mesh) => {
    const material = child.material as THREE.MeshPhongMaterial;
    material.emissive.setHex(color);
  });
}
