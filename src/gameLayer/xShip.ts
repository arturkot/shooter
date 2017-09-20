import { random } from 'lodash';
import { IXShipStateData } from '../main';
import { deg } from '../utils';
import { scene } from './setup';

export let xShip: THREE.Mesh;
export let xShipCollisionElement: THREE.Mesh;
export let exhaustAElement: THREE.Mesh;
export let exhaustBElement: THREE.Mesh;
export let exhaustCElement: THREE.Mesh;

export function updateXShip(xShipState: IXShipStateData) {
  xShip.position.x = xShipState.positionX;
  xShip.position.y = xShipState.positionY;
  xShip.rotation.y = xShipState.rotationY;
  xShip.scale.x = xShipState.scaleX;
  xShip.scale.y = xShipState.scaleY;
  xShip.scale.z = xShipState.scaleZ;

  xShip.children.forEach((child: THREE.Mesh) => {
    child.material.opacity = xShipState.opacity;
  });

  exhaustAElement.scale.x = random(0.8, 1.1, true);
  exhaustAElement.scale.y = random(0.8, 1.1, true);
  exhaustBElement.scale.x = random(0.8, 1.1, true);
  exhaustBElement.scale.y = random(0.8, 1.1, true);
  exhaustCElement.scale.x = random(0.8, 1.1, true);
  exhaustCElement.scale.y = random(0.8, 1.1, true);
}

export function addXShip({
  xShipCloud,
  xShipBody,
  xShipRear,
  xTriangle,
  xChunk,
  shipPositionY,
}: {
  xShipCloud: THREE.Geometry;
  xShipBody: THREE.Geometry;
  xShipRear: THREE.Geometry;
  xTriangle: THREE.Geometry;
  xChunk: THREE.Geometry;
  shipPositionY: number;
}) {
  const collisionGeometry = new THREE.BoxGeometry(0.5, 0.001, 0.1);
  const parentGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const parentMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0,
    side: THREE.BackSide,
    transparent: true,
  });
  const exhaustAGeometry = new THREE.ConeGeometry(0.2, -1, 8);
  const exhaustBGeometry = new THREE.ConeGeometry(0.1, -0.3, 8);
  const exhaustCGeometry = new THREE.ConeGeometry(0.11, -0.4, 8);
  const exhaustMaterial = new THREE.MeshBasicMaterial({
    color: 0x0effff,
    opacity: 0.5,
    transparent: true,
  });
  xShip = new THREE.Mesh(parentGeometry, parentMaterial);
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
  exhaustAElement = exhaustA;

  xShip.add(exhaustB);
  exhaustBElement = exhaustB;

  xShip.add(exhaustC);
  exhaustCElement = exhaustC;

  xShip.add(collision);
  xShipCollisionElement = collision;
}

function _getXCloud(xShipCloud: THREE.Geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xec4d2e,
    side: THREE.BackSide,
    specular: 0xee6760,
    transparent: true,
  });
  const element = new THREE.Mesh(xShipCloud, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXPart(xChunk: THREE.Geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    transparent: true,
  });
  const element = new THREE.Mesh(xChunk, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXBody(xBody: THREE.Geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
  });
  const element = new THREE.Mesh(xBody, material);

  element.rotation.x = deg(90);
  return element;
}

function _getXRear(zRear: THREE.Geometry) {
  const material = new THREE.MeshBasicMaterial({
    color: 0x0effff,
    transparent: true,
  });
  const element = new THREE.Mesh(zRear, material);

  element.rotation.x = deg(90);
  return element;
}
