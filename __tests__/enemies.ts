import {
  getDefaultEnemy,
  updateEnemy
} from '../src/enemies';

describe('when enemy is updated', () => {
  it(`shouldn't affect the previous enemy state`, () => {
    const enemy = getDefaultEnemy(1);
    const enemyClone = Object.assign({}, enemy);

    updateEnemy(enemy, 99);

    expect(enemy).toEqual(enemyClone);
  });
});
