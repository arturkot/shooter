import { GameStateData, XShipStateData } from '../main';
import { GameStatus } from '../gameState';
import { updateXShip } from './xShip';
import { animateSphereBg } from './sphereBg';

export function updateRender(
  gameState: GameStateData,
  xShipState: XShipStateData
) {
  if (
    gameState.gameStatus === GameStatus.autoRewind ||
    gameState.gameStatus === GameStatus.game ||
    gameState.gameStatus === GameStatus.gameOver
  ) {
    updateXShip(xShipState);
  }

  if (gameState.gameStatus === GameStatus.autoRewind) {
    animateSphereBg('back');
  }

  if (gameState.gameStatus === GameStatus.game) {
    animateSphereBg();
  }
}
