import { timeUnit } from '../gameLoop';
import { deg } from '../utils';
// import { scene } from './setup';

type Direction = 'back' | 'forward';

export let sphereBg: THREE.Mesh;

export function animateSphereBg(direction: Direction = 'forward') {
  if (direction === 'forward') {
    sphereBg.rotation.x += -0.01 * timeUnit;
    sphereBg.rotation.z += -0.001 * timeUnit;
  }

  if (direction === 'back') {
    sphereBg.rotation.x += +0.01 * timeUnit;
    sphereBg.rotation.z += +0.001 * timeUnit;
  }
}

export function addSphereBg(geometry: THREE.Geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0x0b1687,
    shading: THREE.FlatShading,
    shininess: 20,
    side: THREE.BackSide,
  });
  sphereBg = new THREE.Mesh(geometry, material);

  sphereBg.position.x = 0;
  sphereBg.position.y = 0;
  sphereBg.position.z = 0;

  sphereBg.rotation.z = deg(90);

  // scene.add(sphereBg);

  return sphereBg;
}
