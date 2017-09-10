import { GameStateData, XShipStateData } from '../main';
import {GameState, GameStatus} from '../gameState';
import { updateXShip } from './xShip';
import { animateSphereBg } from './sphereBg';
import {updateBullet} from './bullets';
import {Bullet} from '../bullets';

export function updateRender(
  gameState: GameStateData,
  xShipState: XShipStateData,
  bulletStates: Bullet[],
  prevBulletStates: GameState<Bullet[]>
) {
  if (
    gameState.gameStatus === GameStatus.autoRewind ||
    gameState.gameStatus === GameStatus.game ||
    gameState.gameStatus === GameStatus.gameOver
  ) {
    updateXShip(xShipState);
  }

  if (
    gameState.gameStatus === GameStatus.game ||
    gameState.gameStatus === GameStatus.gameOver
  ) {
    bulletStates.forEach(updateBullet);
  }

  if (gameState.gameStatus === GameStatus.autoRewind) {
    const prevBullets = prevBulletStates.use() as Bullet[];

    animateSphereBg('back');

    if (prevBullets) {
      prevBullets.forEach(updateBullet);
    }
  }

  if (gameState.gameStatus === GameStatus.game) {
    animateSphereBg();
  }
}
