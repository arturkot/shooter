export let isMoveLeft = false;
export let isMoveRight = false;
export let isShoot = false;

const SPACE = 32;
const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;

addEvents();

function addEvents () {
  window.addEventListener('keydown', handleKeydown, false);
  window.addEventListener('keyup', handleKeyup, false);
}

function removeEvents () {
    window.removeEventListener('keydown', handleKeydown, false);
    window.removeEventListener('keyup', handleKeyup, false);
}

export function resetUserEvents (time: number = 1000) {
  isMoveLeft = false;
  isMoveRight = false;
  isShoot = false;

  if (time) {
    removeEvents();
    setTimeout(addEvents, time)
  }
}

function handleKeydown (event: KeyboardEvent) {
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

function handleKeyup (event: KeyboardEvent) {
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
