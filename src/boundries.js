export const GAME_HEIGHT = 15;
export const RATIO = 9 / 16;
export const gameWidth = GAME_HEIGHT * RATIO;
export const leftBoundry = (gameWidth / -2);
export const rightBoundry = (gameWidth / 2);

export function addBoundries (scene) {
  const boundriesGeo = new THREE.BoxGeometry(
    gameWidth,
    GAME_HEIGHT,
    1
  );
  const boundriesMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true
  });
  const boundries = new THREE.Mesh(boundriesGeo, boundriesMaterial);
  scene.add(boundries);
}
