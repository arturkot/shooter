import {ENABLE_STATS} from './settings';
import {camera, renderer, scene} from './setup';
const fps = 60;
const interval = 1000 / fps;
let then = performance.now();
const stats = new Stats();
let now;
let delta;


if (ENABLE_STATS) {
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

export function gameLoop (callback: () => void) {
  requestAnimationFrame( () => gameLoop(callback) );

  now = performance.now();
  delta = now - then;

  if (delta > interval) {
    if (ENABLE_STATS) { stats.begin(); }
    then = now - (delta % fps);
    for (let i = 0; i < Math.ceil(interval / delta); i++) {
      callback();
    }
    renderer.render(scene, camera);
    if (ENABLE_STATS) { stats.end(); }
  }
}
