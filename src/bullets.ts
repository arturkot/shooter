import * as settings from './settings';
import {range} from 'lodash';
import {Enemy} from './enemies';
import {circlePointCollision} from './collisionDetection';
import {timeUnit} from './gameLoop';

export interface Bullet {
  id: number;
  x: number;
  y: number;
  height: number;
  isActive: boolean;
  emittedAt?: number;
};

export const bulletElements: THREE.Mesh[] = [];

export function generateBullets (maxNr: number, scene: THREE.Scene) {
  const OFFSCREEN = 9999;
  const array = range(maxNr);
  const bullets = array.map( () => {
    const geometry = new THREE.ConeGeometry(0.1, 0.6, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const element = new THREE.Mesh(geometry, material);

    element.position.y = OFFSCREEN;
    scene.add(element);
    bulletElements.push(element);

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
  const updatedBullet = {
    x: bullet.x,
    y: bullet.y,
    isActive: bullet.isActive,
    emittedAt: bullet.emittedAt
  };

  if (
    bullet.isActive &&
    bullet.y > bullet.height * maxBulletsOnScreen) {
    updatedBullet.isActive = false;
  }

  if (bullet.isActive) {
    updatedBullet.y += bulletSpeed * timeUnit;
  }

  if (bullet.id === freeBulletId) {
    updatedBullet.isActive = true;
    updatedBullet.x = x;
    updatedBullet.y = defaultY + 0.9;
    updatedBullet.emittedAt = Date.now();

    if (bulletEmittedCallback) {
      bulletEmittedCallback(bullet);
    }
  }

  return Object.assign(bullet, updatedBullet);
}

export function detectBulletCollisionAgainstEnemies (bullet: Bullet, enemies: Enemy[], {
  collisionCallback
}: {
  collisionCallback?: (enemy: Enemy) => void
} = {}) {
  if (!bullet.isActive) {
    return;
  }

  enemies.forEach(enemy => {
    const enemyRange = {
      x: enemy.x,
      y: enemy.y,
      radius: 0.8
    };

    if (
      enemy.isActive &&
      !enemy.isDestroyed &&
      circlePointCollision(bullet.x, bullet.y, enemyRange)
    ) {
      bullet.isActive = false;

      if (collisionCallback) {
        collisionCallback(enemy);
      }
    }
  });
}

export function updateBulletInScene (bullet: Bullet) {
  const OFFSCREEN = 9999;
  const element = bulletElements.find(element => element.id === bullet.id);

  if (!element) {
    return;
  }

  if (bullet.isActive) {
    element.position.x = bullet.x;
    element.position.y = bullet.y;
  } else {
    element.position.y = OFFSCREEN;
  }
}
