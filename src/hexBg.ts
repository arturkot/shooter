import { random, range } from 'lodash';
import { GAME_HEIGHT, gameWidth, leftBoundary } from './boundaries';
import { deg } from './utils';

export interface IHex {
  x: number;
  y: number;
  rotationX: number;
  flipSpeed: number;
}

export function generateHexBg(rows = 22, columns = gameWidth + 2) {
  const rowArr = range(rows);
  const colArr = range(columns);

  return rowArr.reduce(
    (array, rowIndex) => {
      return array.concat(
        colArr.map(colIndex => generateHex(colIndex, rowIndex))
      );
    },
    [] as IHex[]
  );
}

export function updateHex(hex: IHex) {
  const SPEED = 0.1;
  const HEX_HEIGHT = 1;

  hex.y =
    hex.y <= -1 - GAME_HEIGHT / 2 + HEX_HEIGHT / 4
      ? hex.y + 22 - GAME_HEIGHT / 2 + 8 * HEX_HEIGHT / 4 - SPEED
      : hex.y - SPEED;
}

function generateHex(x: number, y: number): IHex {
  const HEX_HEIGHT = 1;
  const HEX_WIDTH = Math.sqrt(3) / 2 * HEX_HEIGHT;
  const adjustedX =
    y % 2 === 0
      ? x * HEX_WIDTH + leftBoundary
      : x * HEX_WIDTH + leftBoundary + HEX_WIDTH / 2;

  return {
    x: adjustedX,
    y: y - GAME_HEIGHT / 2 - y * HEX_HEIGHT / 4,
    rotationX: deg(0),
    flipSpeed: random(0.05, 0.1, true),
  };
}
