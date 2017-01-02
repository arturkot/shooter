import * as settings from './settings';
import { range } from "lodash";
import { Enemy } from "./enemies";
import { rectIntersect } from "./collisionDetection";

export interface Bullet {
  id: number;
  x: number;
  y: number;
  height: number;
  isActive: boolean;
  emittedAt?: number;
};

export function generateBullets (maxNr: number, scene: THREE.Scene) {
  const OFFSCREEN = 9999;
  const array = range(maxNr);
  const bullets = array.map( () => {
    const geometry = new THREE.ConeGeometry(0.1, 0.6, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const element = new THREE.Mesh(geometry, material);

    element.position.y = OFFSCREEN;
    scene.add(element);

    const bullet: Bullet = {
      id: element.id,
      x: OFFSCREEN,
      y: OFFSCREEN,
      height: new THREE.Box3().setFromObject(element).getSize().y,
      isActive: false,
      emittedAt: undefined
    };

    return bullet;
  });

  return bullets;
}

export function getFreeBulletId (bullets: Bullet[], isShoot: boolean) {
  const NON_EXISTENT_ID = -1;

  if (!isShoot) { return NON_EXISTENT_ID; }

  const MIN_DELAY = 400;
  const lastBullet = bullets
    .filter( bullet => bullet.isActive )
    .sort( (bulletA, bulletB) => bulletB.emittedAt - bulletA.emittedAt)
    [0];

  if (
    !lastBullet ||
    Date.now() - lastBullet.emittedAt > MIN_DELAY
  ) {
    const freeBullet = bullets.find( bullet => !bullet.isActive );

    if (freeBullet) {
      return freeBullet.id;
    }
  }

  return NON_EXISTENT_ID;
}

export function updateBullet (bullet: Bullet, freeBulletId: number, x: number, {
  defaultY = settings.XSHIP_Y,
  bulletSpeed = settings.BULLET_SPEED,
  maxBulletsOnScreen = settings.MAX_BULLETS_ON_SCREEN,
  bulletEmittedCallback
}: {
  defaultY?: number;
  bulletSpeed?: number;
  maxBulletsOnScreen?: number;
  bulletEmittedCallback?: (thisBullet: Bullet) => void;
} = {}) {
  const thisBullet = Object.assign({}, bullet);

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

export function detectBulletCollisionAgainstEnemies (bullet: Bullet, enemies: Enemy[], scene: THREE.Scene, {
  collisionCallback
}: {
  collisionCallback?: (enemy: Enemy) => void
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

export function updateBulletInScene (bullet: Bullet, scene: THREE.Scene) {
  const OFFSCREEN = 9999;
  const element = scene.getObjectById(bullet.id);

  if (bullet.isActive) {
    element.position.x = bullet.x;
    element.position.y = bullet.y;
  } else {
    element.position.y = OFFSCREEN;
  }
}
