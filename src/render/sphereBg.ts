import { deg } from "../utils";
import {timeUnit} from '../gameLoop';

type Direction = 'back' | 'forward';

export let sphereBg: THREE.Mesh;

export function animateSphereBg (direction: Direction = 'forward') {
  switch (direction) {
    case 'forward':
      sphereBg.rotation.x += -0.01 * timeUnit;
      sphereBg.rotation.z += -0.001 * timeUnit;
      break;
    case 'back':
      sphereBg.rotation.x += +0.01 * timeUnit;
      sphereBg.rotation.z += +0.001 * timeUnit;
  }
}

export function addSphereBg (geometry: THREE.Geometry, scene: THREE.Scene) {
  const material = new THREE.MeshPhongMaterial({
    color: 0x0B1687,
    side: THREE.BackSide,
    shininess: 20,
    shading: THREE.FlatShading
  });
  sphereBg = new THREE.Mesh(geometry, material);

  sphereBg.position.x = 0;
  sphereBg.position.y = 0;
  sphereBg.position.z = 0;

  sphereBg.rotation.z = deg(90);

  scene.add(sphereBg);

  return sphereBg;
}
