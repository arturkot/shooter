import { GameStateData, XShipStateData } from '../main';
import {GameStatus} from '../gameState';
import { updateXShip } from './xShip';
import { animateSphereBg } from './sphereBg';
import {updateBullet} from './bullets';
import {Bullet} from '../bullets';
import {updateEnemyInScene} from './enemies';
import {Enemy} from '../enemies';

export function updateRender(
  gameState: GameStateData,
  xShipState: XShipStateData,
  bulletStates: Bullet[],
  enemiesState: Enemy[]
) {
  if (
    gameState.gameStatus === GameStatus.autoRewind ||
    gameState.gameStatus === GameStatus.game ||
    gameState.gameStatus === GameStatus.gameOver
  ) {
    updateXShip(xShipState);
    enemiesState.forEach(enemy => updateEnemyInScene(enemy));
  }

  if (
    gameState.gameStatus === GameStatus.game ||
    gameState.gameStatus === GameStatus.gameOver
  ) {
    bulletStates.forEach(updateBullet);
  }

  if (gameState.gameStatus === GameStatus.autoRewind) {
    animateSphereBg('back');
    bulletStates.forEach(updateBullet);
  }

  if (gameState.gameStatus === GameStatus.game) {
    animateSphereBg();
  }
}
