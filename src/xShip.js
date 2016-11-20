export function addXShip (scene) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const xShip = new THREE.Mesh(geometry, material);
  xShip.position.y = -6;
  scene.add(xShip);

  return xShip;
}

export function moveXShip (xShip, isMoveLeft = false, isMoveRight = false) {
  if (isMoveLeft) {
    xShip.position.x -= 0.1;
  }

  if (isMoveRight) {
    xShip.position.x += 0.1;
  }
}
