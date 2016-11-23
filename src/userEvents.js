export let isMoveLeft = false;
export let isMoveRight = false;
export let isShoot = false;

const SPACE = 32;
const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;

window.addEventListener('keydown', handleKeydown, false);
window.addEventListener('keyup', handleKeyup, false);

export function resetUserEvents () {
  isMoveLeft = false;
  isMoveRight = false;
  isShoot = false;
}

function handleKeydown (event) {
  const { keyCode } = event;

  switch (keyCode) {
    case ARROW_LEFT:
      isMoveLeft = true;
      break;
    case ARROW_RIGHT:
      isMoveRight = true;
      break;
    case SPACE:
      isShoot = true;
  }
}

function handleKeyup (event) {
  const { keyCode } = event;

  switch (keyCode) {
    case ARROW_LEFT:
      isMoveLeft = false;
      break;
    case ARROW_RIGHT:
      isMoveRight = false;
      break;
    case SPACE:
      isShoot = false;
  }
}
