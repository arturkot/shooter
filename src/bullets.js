import { range } from "lodash";
import { rangeIntersects, rectIntersect } from "./collisionDetection";

export function generateBullets (maxNr, scene) {
  const OFFSCREEN = 9999;
  const bullets = range(maxNr);

  return bullets.map( () => {
    const geometry = new THREE.ConeGeometry(0.1, 0.6, 8);;
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const element = new THREE.Mesh(geometry, material);

    element.position.y = OFFSCREEN;
    scene.add(element);

    return {
      id: element.id,
      x: OFFSCREEN,
      y: OFFSCREEN,
      height: new THREE.Box3().setFromObject(element).getSize().y,
      isActive: false,
      emittedAt: undefined
    };
  });
}

export function getFreeBulletId (ammo, isShoot) {
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
    const freeBullet = ammo.find( bullet => !bullet.isActive ) || {};
    return freeBullet.id;
  }
}

export function updateBullet ({
  bullet, index, enemies, bulletSpeed,
  x, defaultY, maxBulletsOnScreen, freeBulletId,
  bulletEmittedCallback
}) {
  const thisBullet = Object.assign({}, bullet)

  if (
    thisBullet.isActive &&
    thisBullet.y > thisBullet.height * maxBulletsOnScreen) {
    thisBullet.isActive = false;
  }

  if (thisBullet.isActive) {
    thisBullet.y += bulletSpeed;
  }

  if (thisBullet.id === freeBulletId) {
    thisBullet.isActive = true;
    thisBullet.x = x;
    thisBullet.y = defaultY + 0.9;
    thisBullet.emittedAt = Date.now();
    if (bulletEmittedCallback) {
      bulletEmittedCallback(thisBullet);
    }
  }

  return thisBullet;
}

export function detectBulletCollisionAgainstEnemies ({
  bullet, enemies, scene, collisionCallback
} = {}) {
  const thisBullet = Object.assign({}, bullet);

  enemies.filter(enemy => enemy.isActive).forEach(enemy => {
    const enemyElement = scene.getObjectById(enemy.id);
    const bulletElement = scene.getObjectById(thisBullet.id);
    const enemyBox = new THREE.Box3().setFromObject(enemyElement);
    const bulletBox = new THREE.Box3().setFromObject(bulletElement);

    if ( rectIntersect(enemyBox, bulletBox) ) {
      thisBullet.isActive = false;

      if (collisionCallback) {
        collisionCallback(enemy);
      }
    }
  });

  return thisBullet;
}

export function updateBulletInScene (bullet, scene) {
  const OFFSCREEN = 9999;
  const element = scene.getObjectById(bullet.id);

  if (bullet.isActive) {
    element.position.x = bullet.x;
    element.position.y = bullet.y;
  } else {
    element.position.y = OFFSCREEN;
  }
}
