export const GAME_HEIGHT = 15;
export const RATIO = 0.5625;
export const gameWidth = GAME_HEIGHT * RATIO;
export const leftBoundry = (gameWidth / -2);
export const rightBoundry = (gameWidth / 2);

export default function (scene) {
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
