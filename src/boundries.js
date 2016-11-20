export default function (scene) {
  const GAME_HEIGHT = 15;
  const RATIO_1080p = 0.5625;
  const boundriesGeo = new THREE.BoxGeometry(
    GAME_HEIGHT * RATIO_1080p,
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
