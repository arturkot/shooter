import { last, range } from "lodash";

export function generateBullets (maxNr, scene) {
  const OFFSCREEN_Y = 9999;
  const bullets = range(maxNr);

  return bullets.map( () => {
    const geometry = new THREE.BoxGeometry(0.2, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const element = new THREE.Mesh(geometry, material);

    element.position.y = OFFSCREEN_Y;
    scene.add(element);

    return {
      element,
      box3: new THREE.Box3().setFromObject(element),
      isActive: false,
      emittedAt: undefined
    };
  });
}

export function emitBullet (ammo, xShip, isShoot) {
  if (!isShoot) { return; }

  const MIN_DELAY = 400;
  const lastBullet = ammo
    .filter( bullet => bullet.isActive )
    .sort( (bulletA, bulletB) => bulletB.emittedAt - bulletA.emittedAt)
    [0];

  if (
    !lastBullet ||
    Date.now() - lastBullet.emittedAt > MIN_DELAY
  ) {
    const freeBullet = ammo.find( bullet => !bullet.isActive);

    if (!freeBullet) { return; }

    const { element } = freeBullet;

    element.position.x = xShip.position.x;
    element.position.y = xShip.position.y;
    freeBullet.isActive = true;
    freeBullet.emittedAt = Date.now();
  }
}

export function updateBullets (ammo, enemies, collisionCallback) {
  ammo
    .filter(bullet => bullet.isActive)
    .forEach( updateBullet.bind(null, collisionCallback, enemies) );
}

function updateBullet (collisionCallback, enemies, bullet) {
  const MAX_BULLETS_ON_SCREEN = 10;

  if (bullet.element.position.y > bullet.box3.getSize().y * MAX_BULLETS_ON_SCREEN) {
    bullet.isActive = false;
  } else {
    bullet.element.position.y += 0.3;
  }

  enemies.filter(enemy => enemy.isActive).forEach(enemy => {
    const enemyBox = new THREE.Box3().setFromObject(enemy.element);
    const bulletBox = new THREE.Box3().setFromObject(bullet.element);

    if ( rectIntersect(enemyBox, bulletBox) ) {
      bullet.isActive = false;
      bullet.element.position.y = 9999;
      collisionCallback(enemy);
    }
  });
}

function rangeIntersects (min0, max0, min1, max1) {
  return  Math.max(min0, max0) >= Math.min(min1, max1) &&
          Math.min(min0, max0) <= Math.max(min1, max1);
}

function rectIntersect (box3A, box3B) {
  return  rangeIntersects(box3A.min.x, box3A.max.x, box3B.min.x, box3B.max.x) &&
          rangeIntersects(box3A.min.y, box3A.max.y, box3B.min.y, box3B.max.y);
}
