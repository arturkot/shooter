import {ENABLE_STATS} from './settings';
import {camera, renderer, scene} from './setup';

const FPS = 60;
const INTERVAL = 1000 / FPS;
const stats = new Stats();

let rafThen = Date.now();
let then = Date.now();
let now, delta, rafNow, rafDelta;

if (ENABLE_STATS) {
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

export let timeUnit = 1;

export function gameLoop (callback: () => void) {
  requestAnimationFrame( () => gameLoop(callback) );

  rafNow = Date.now();
  rafDelta = rafNow - rafThen;

  if (rafDelta > INTERVAL) {
    if (ENABLE_STATS) { stats.begin(); }
    now = Date.now();
    delta = now - then;
    then = now;
    timeUnit = Math.ceil(100 * delta / INTERVAL) / 100;
    rafThen = rafNow - (rafDelta % FPS);
    callback();
    renderer.render(scene, camera);
    if (ENABLE_STATS) { stats.end(); }
  }
}
