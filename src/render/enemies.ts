import {scene} from './setup';
import {deg} from '../utils';
import {Enemy} from '../enemies';
import {random} from 'lodash';

export const enemyElements: THREE.Mesh[] = [];

export function addEnemies(initialEnemies: Enemy[], xTriangle: THREE.Geometry) {
  const OFFSCREEN = 9999;

  initialEnemies.forEach(() => {
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
    enemyElements.push(element);
    element.add(triangleA);
    element.add(triangleB);
  });
}

export function updateEnemyInScene(enemy: Enemy) {
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

export function resetEnemiesAppearanceInScene(enemies: Enemy[]) {
  enemies.forEach(enemy => {
    const element = enemyElements[enemy.id];

    if (!element) {
      return;
    }

    const material = element.material as THREE.MeshBasicMaterial;
    material.color.setHex(0x2C88D8);
  });
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
