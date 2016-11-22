import { deg } from "./utils";

export function animateSphereBg (sphereBg) {
  sphereBg.rotation.x  += -0.01;
  sphereBg.rotation.z  += -0.001;
}

export function addSphereBg (geometry, scene) {
  const material = new THREE.MeshPhongMaterial({
    color: 0x0B1687,
    side: THREE.BackSide,
    shininess: 20,
    shading: THREE.FlatShading
  });
  const sphereBg = new THREE.Mesh(geometry, material);

  sphereBg.position.x = 0;
  sphereBg.position.y = 0;
  sphereBg.position.z = 0;

  sphereBg.rotation.z = deg(90);

  scene.add(sphereBg);

  return sphereBg;
}
