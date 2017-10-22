import { IXShipStateData } from '../main';
import { scene } from './setup';

export let xShip: THREE.Mesh;

export function updateXShip(xShipState: IXShipStateData) {
  xShip.position.x = xShipState.positionX;
  xShip.position.y = xShipState.positionY;
  xShip.rotation.y = xShipState.rotationY;
  xShip.scale.x = xShipState.scaleX;
  xShip.scale.y = xShipState.scaleY;
  xShip.scale.z = xShipState.scaleZ;

  xShip.material.opacity = xShipState.opacity;
}

export function addXShip({
  xShipGeo,
  shipPositionY,
}: {
  xShipGeo: THREE.Geometry;
  shipPositionY: number;
}) {
  const texture = new THREE.TextureLoader().load('/textures/xShip.png');
  const material = new THREE.MeshPhongMaterial({ map: texture });
  xShip = new THREE.Mesh(xShipGeo, material);

  xShip.position.y = shipPositionY;
  scene.add(xShip);
}
