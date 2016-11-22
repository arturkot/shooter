import { random } from "lodash";
import { deg } from "./utils";

export function addXShip ({
    xShipCloud, xShipBody, xShipRear,
    xTriangle, xChunk, scene, y
} = {}) {
  const parentGeometry = new THREE.BoxGeometry(1, 1, 1);
  const parentMaterial = new THREE.MeshBasicMaterial({
    opacity: 0,
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
  const exhaustA = new THREE.Mesh(exhaustAGeometry, exhaustMaterial);
  const exhaustB = new THREE.Mesh(exhaustBGeometry, exhaustMaterial);
  const exhaustC = new THREE.Mesh(exhaustCGeometry, exhaustMaterial);
  const xCloud = _getXCloud(xShipCloud);
  const xTopRight = _getXPart(xChunk);
  const xBottomRight = _getXPart(xChunk);
  const xLeft = _getXPart(xTriangle);
  const body = _getXBody(xShipBody);
  const rear = _getXRear(xShipRear);

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

  xShip.position.y = y;
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

  return xShip;
}

export function moveXShip ({
  xShip, leftBoundry, rightBoundry,
  isMoveLeft = false,
  isMoveRight = false,
}) {
  const MAX_ROTATION = 45;
  const ROTATION_SPEED = 1.4;

  const exhaustA = xShip.getObjectByName('exhaustA');
  const exhaustB = xShip.getObjectByName('exhaustB');
  const exhaustC = xShip.getObjectByName('exhaustC');

  if (isMoveLeft) {
    xShip.position.x = xShip.position.x <= leftBoundry ?
      leftBoundry :
      xShip.position.x - 0.2;

    xShip.rotation.y = xShip.rotation.y <= deg(-MAX_ROTATION) ?
      deg(-MAX_ROTATION) :
      xShip.rotation.y - deg(ROTATION_SPEED);
  } else if (isMoveRight) {
    xShip.position.x = xShip.position.x >= rightBoundry ?
      rightBoundry :
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

function _getXCloud (xShipCloud) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xEC4D2E,
    specular: 0xEE6760,
    shiness: 1,
    side: THREE.BackSide
  });
  const element = new THREE.Mesh(xShipCloud, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXPart (xChunk) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.BackSide
  });
  const element = new THREE.Mesh(xChunk, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXBody (xBody) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff
  });
  const element = new THREE.Mesh(xBody, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXRear (zRear) {
  const material = new THREE.MeshBasicMaterial({
    color: 0x0EFFFF
  });
  const element = new THREE.Mesh(zRear, material);

  element.rotation.x = deg(90);
  return element;
}
