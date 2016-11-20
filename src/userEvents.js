export let isMoveLeft = false;
export let isMoveRight = false;
export let isShoot = false;

window.addEventListener('keydown', handleKeydown, false);
window.addEventListener('keyup', handleKeyup, false);

function handleKeydown (event) {
  const { key } = event;

  switch (key) {
    case 'ArrowLeft':
      isMoveLeft = true;
      break;
    case 'ArrowRight':
      isMoveRight = true;
      break;
    case ' ':
      isShoot = true;
  }
}

function handleKeyup (event) {
  const { key } = event;

  switch (key) {
    case 'ArrowLeft':
      isMoveLeft = false;
      break;
    case 'ArrowRight':
      isMoveRight = false;
      break;
    case ' ':
      isShoot = false;
  }
}
