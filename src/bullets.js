import { last, range } from "lodash";

export function generateBullets (maxNr, scene) {
  const OFFSCREEN_Y = 9999;
  const bulllets = range(maxNr);

  return bulllets.map( () => {
    const geometry = new THREE.BoxGeometry(0.2, 1, 1);
    const element = new THREE.Mesh(geometry);

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

  const MIN_DELAY = 200;
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

export function updateBullets (ammo) {
  ammo.forEach(updateBullet);
}

function updateBullet (bullet) {
  const MAX_BULLETS_ON_SCREEN = 10;

  if (bullet.isActive) {
    if (bullet.element.position.y > bullet.box3.getSize().y * MAX_BULLETS_ON_SCREEN) {
      bullet.isActive = false;
    } else {
      bullet.element.position.y += 0.3;
    }
  }
}
