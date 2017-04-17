import {Enemy, enemyElements} from "./enemies";
import { random } from "lodash";
import { deg } from "./utils";
import { rectIntersect } from "./collisionDetection";
import * as boundaries from "./boundaries";
import {gameWidth} from './boundaries';

export function addXShip ({
    xShipCloud, xShipBody,
    xShipRear, xTriangle,
    xChunk, scene, shipPositionY
}: {
  xShipCloud: THREE.Geometry, xShipBody: THREE.Geometry,
  xShipRear: THREE.Geometry, xTriangle: THREE.Geometry,
  xChunk: THREE.Geometry, scene: THREE.Scene, shipPositionY: number
}) {
  const collisionGeometry = new THREE.BoxGeometry(0.5, 0.001, 0.1);
  const parentGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const parentMaterial = new THREE.MeshBasicMaterial({
    opacity: 0,
    color: 0xFF0000,
    transparent: true,
    side: THREE.BackSide
  });
  const exhaustAGeometry = new THREE.ConeGeometry(0.2, -1, 8);
  const exhaustBGeometry = new THREE.ConeGeometry(0.1, -0.3, 8);
  const exhaustCGeometry = new THREE.ConeGeometry(0.11, -0.4, 8);
  const exhaustMaterial = new THREE.MeshBasicMaterial({
    color: 0x0EFFFF,
    opacity: 0.5,
    transparent: true
  });
  const xShip = new THREE.Mesh(parentGeometry, parentMaterial);
  const collision = new THREE.Mesh(collisionGeometry, parentMaterial);
  const exhaustA = new THREE.Mesh(exhaustAGeometry, exhaustMaterial);
  const exhaustB = new THREE.Mesh(exhaustBGeometry, exhaustMaterial);
  const exhaustC = new THREE.Mesh(exhaustCGeometry, exhaustMaterial);
  const xCloud = _getXCloud(xShipCloud);
  const xTopRight = _getXPart(xChunk);
  const xBottomRight = _getXPart(xChunk);
  const xLeft = _getXPart(xTriangle);
  const body = _getXBody(xShipBody);
  const rear = _getXRear(xShipRear);

  collision.name = 'collision';
  collision.position.y = -0.5;

  xBottomRight.material.side = THREE.FrontSide;
  xBottomRight.position.y = 0.17;
  xBottomRight.scale.z = -1;

  exhaustA.name = 'exhaustA';
  exhaustA.position.y = -0.85;

  exhaustB.name = 'exhaustB';
  exhaustB.position.x = -0.2;
  exhaustB.position.y = -0.5;

  exhaustC.name = 'exhaustC';
  exhaustC.position.x = 0.2;
  exhaustC.position.y = -0.55;

  xShip.position.y = shipPositionY;
  scene.add(xShip);
  xShip.add(xCloud);
  xShip.add(xTopRight);
  xShip.add(xBottomRight);
  xShip.add(xLeft);
  xShip.add(body);
  xShip.add(rear);
  xShip.add(exhaustA);
  xShip.add(exhaustB);
  xShip.add(exhaustC);
  xShip.add(collision);

  return xShip;
}

export function moveXShip (xShip: THREE.Mesh, isMoveLeft = false, isMoveRight = false, {
  leftBoundary = boundaries.leftBoundary,
  rightBoundary = boundaries.rightBoundary,
  mouseX
}: {
  leftBoundary?: number,
  rightBoundary?: number,
  mouseX?: number
} = {}) {
  const MAX_ROTATION = 45;
  const ROTATION_SPEED = 1.4;

  const exhaustA = xShip.getObjectByName('exhaustA');
  const exhaustB = xShip.getObjectByName('exhaustB');
  const exhaustC = xShip.getObjectByName('exhaustC');

  if (mouseX) {
    xShip.position.x = gameWidth * mouseX - gameWidth / 2;
  } else if (isMoveLeft) {
    xShip.position.x = xShip.position.x <= leftBoundary ?
      leftBoundary :
      xShip.position.x - 0.2;

    xShip.rotation.y = xShip.rotation.y <= deg(-MAX_ROTATION) ?
      deg(-MAX_ROTATION) :
      xShip.rotation.y - deg(ROTATION_SPEED);
  } else if (isMoveRight) {
    xShip.position.x = xShip.position.x >= rightBoundary ?
      rightBoundary :
      xShip.position.x + 0.2;

    xShip.rotation.y = xShip.rotation.y >= deg(MAX_ROTATION) ?
      deg(MAX_ROTATION) :
      xShip.rotation.y + deg(ROTATION_SPEED);
  } else if (xShip.rotation.y !== 0) {
    if (xShip.rotation.y > 0) {
      xShip.rotation.y -= deg(ROTATION_SPEED / 2);
    } else {
      xShip.rotation.y += deg(ROTATION_SPEED / 2);
    }
  }

  exhaustA.scale.x = random(0.8, 1.1, true);
  exhaustA.scale.y = random(0.8, 1.1, true);
  exhaustB.scale.x = random(0.8, 1.1, true);
  exhaustB.scale.y = random(0.8, 1.1, true);
  exhaustC.scale.x = random(0.8, 1.1, true);
  exhaustC.scale.y = random(0.8, 1.1, true);
}

export function resetXShip (xShip: THREE.Mesh, y: number) {
  xShip.rotation.y = 0;
  xShip.scale.x = 1;
  xShip.scale.y = 1;
  xShip.scale.z = 1;
  xShip.position.y = y;

  xShip.children.forEach( (child: THREE.Mesh) => {
    child.material.opacity = 1;
  });
}

export function destroyXShip (xShip: THREE.Mesh) {
  if (xShip.scale.x >= 0) {
    xShip.rotation.y += 0.1;
    xShip.scale.x -= 0.01;
    xShip.scale.y -= 0.01;
    xShip.scale.z -= 0.01;
    xShip.position.y += 0.1;

    xShip.children.forEach( (child: THREE.Mesh) => {
      child.material.opacity -= 0.01;
    });
  }
}

export function detectBulletCollisionAgainstXShip (xShip: THREE.Mesh, enemies: Enemy[], {
  collisionCallback
}: {
  collisionCallback?: (enemy: Enemy) => void
} = {}) {
  enemies.filter(enemy => enemy.isActive).forEach(enemy => {
    const enemyElement = enemyElements.find( element => element.id === enemy.id);

    if (!enemyElement) {
      return;
    }

    const enemyBox = new THREE.Box3().setFromObject(enemyElement);
    const collision = xShip.getObjectByName('collision');
    const xShipBox = new THREE.Box3().setFromObject(collision);

    if ( rectIntersect(enemyBox, xShipBox) ) {
      if (collisionCallback) {
        collisionCallback(enemy);
      }
    }
  });
}

function _getXCloud (xShipCloud: THREE.Geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xEC4D2E,
    specular: 0xEE6760,
    side: THREE.BackSide,
    transparent: true
  });
  const element = new THREE.Mesh(xShipCloud, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXPart (xChunk: THREE.Geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    transparent: true
  });
  const element = new THREE.Mesh(xChunk, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXBody (xBody: THREE.Geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true
  });
  const element = new THREE.Mesh(xBody, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXRear (zRear: THREE.Geometry) {
  const material = new THREE.MeshBasicMaterial({
    color: 0x0EFFFF,
    transparent: true
  });
  const element = new THREE.Mesh(zRear, material);

  element.rotation.x = deg(90);
  return element;
}
