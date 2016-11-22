export function addXShip (scene, y) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const xShip = new THREE.Mesh(geometry, material);
  xShip.position.y = y;
  scene.add(xShip);

  return xShip;
}

export function moveXShip (xShip, isMoveLeft = false, isMoveRight = false) {
  if (isMoveLeft) {
    xShip.position.x -= 0.2;
  }

  if (isMoveRight) {
    xShip.position.x += 0.2;
  }
}
