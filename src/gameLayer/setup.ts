const GAME_HEIGHT = 750;
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -100,
  window.innerWidth / 100,
  window.innerHeight / 100,
  window.innerHeight / -100,
  -1000,
  1000
);
const renderer = new THREE.WebGLRenderer({ alpha: true });
const light = new THREE.PointLight(0xffffff, 2, 200);
const pixelRatio = window.devicePixelRatio;

renderer.setSize(
  window.innerWidth * pixelRatio,
  window.innerHeight * pixelRatio
);
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', updateSize);
updateSize();
light.position.set(8, 4, 10);
scene.add(light);

function updateSize() {
  renderer.setSize(
    window.innerWidth * pixelRatio,
    window.innerHeight * pixelRatio
  );
  camera.left = window.innerWidth / -100;
  camera.right = window.innerWidth / 100;
  camera.top = window.innerHeight / 100;
  camera.bottom = window.innerHeight / -100;
  camera.zoom = window.innerHeight / GAME_HEIGHT;
  camera.updateProjectionMatrix();
}

export { scene, camera, renderer };
