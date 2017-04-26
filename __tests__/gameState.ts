import {GameState, GameStatus} from '../src/gameState';
import {DEFAULT_SCORE, LIVES} from '../src/settings';
import {GameStateData} from '../src/main';

const initialGameState: GameStateData = {
  gameStatus: GameStatus.initial,
  score: DEFAULT_SCORE,
  lives: LIVES
};

describe(`gameState`, () => {
  it(`should get default state`, () => {
    const gameState = new GameState(1, initialGameState);
    expect(gameState.get()).toEqual(initialGameState);
  });

  it(`should add new entry to the state`, () => {
    const gameState = new GameState(1, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    expect(gameState.get()).toEqual({ score: 1});
  });

  it(`should return the latest entry`, () => {
    const gameState = new GameState(1, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    gameState.add({ score: 55 } as GameStateData);
    gameState.add({ score: 12 } as GameStateData);

    expect(gameState.get()).toEqual({ score: 12});
  });

  it(`should reset values`, () => {
    const gameState = new GameState(2, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    gameState.add({ score: 55 } as GameStateData);
    gameState.add({ score: 12 } as GameStateData);
    gameState.reset();

    expect(gameState.values.length).toEqual(2);
    expect(gameState.get()).toEqual(initialGameState);
    expect(gameState.get(1)).toEqual(initialGameState);
  });

  it(`should handle pool overflow`, () => {
    const gameState = new GameState(2, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    gameState.add({ score: 55 } as GameStateData);
    gameState.add({ score: 12 } as GameStateData);
    gameState.add({ score: 4 } as GameStateData);

    expect(gameState.values.length).toBe(2);
    expect(gameState.get()).toEqual({ score: 4});
  });

  it(`should mark used items`, () => {
    const gameState = new GameState(3, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    gameState.add({ score: 55 } as GameStateData);
    gameState.add({ score: 12 } as GameStateData);
    gameState.add({ score: 4 } as GameStateData);

    expect(gameState.values.length).toBe(3);
    expect(gameState.use()).toEqual({ score: 4});
    expect(gameState.get()).toEqual({ score: 12});

    gameState.add({ score: 66 } as GameStateData);

    expect(gameState.use()).toEqual({ score: 66});
  });

  it(`should mark selected used items`, () => {
    const gameState = new GameState(3, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    gameState.add({ score: 55 } as GameStateData);
    gameState.add({ score: 12 } as GameStateData);
    gameState.add({ score: 4 } as GameStateData);

    expect(gameState.values.length).toBe(3);
    expect(gameState.use(1)).toEqual({ score: 12});
    expect(gameState.get()).toEqual({ score: 4});

    gameState.add({ score: 66 } as GameStateData);

    expect(gameState.use(1)).toEqual({ score: 4});
  });

  it(`should return false in case useLatest all items have been used`, () => {
    const gameState = new GameState(2, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    gameState.add({ score: 55 } as GameStateData);

    gameState.use();
    gameState.use();

    expect(gameState.use()).toBe(false);
  });

  it(`should return the latest value even if all items have been used`, () => {
    const gameState = new GameState(3, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    gameState.add({ score: 55 } as GameStateData);
    gameState.add({ score: 11 } as GameStateData);

    gameState.use();
    gameState.use();
    gameState.use();

    expect(gameState.get()).toEqual({ score: 1 });
  });

  it(`should return the value with given index`, () => {
    const gameState = new GameState(3, initialGameState);

    gameState.add({ score: 1 } as GameStateData);
    gameState.add({ score: 55 } as GameStateData);
    gameState.add({ score: 11 } as GameStateData);

    gameState.use();
    gameState.use();
    gameState.use();

    expect(gameState.get(2)).toEqual({ score: 11 });
  });

  it(`should return the latest state in case requested index isn't available`, () => {
    const gameState = new GameState(3, initialGameState);
    expect(gameState.get(2)).toEqual(initialGameState);
  });

  it(`should update the latest state`, () => {
    const initialGameStateCopy = Object.assign({}, initialGameState);
    const gameState = new GameState(3, initialGameState);
    const newState = {
      score: 33
    } as GameStateData;

    gameState.replaceLatest(newState);

    expect(gameState.get()).toEqual(newState);
    expect(initialGameState).toEqual(initialGameStateCopy);

    gameState.add({ score: 55 } as GameStateData);
    gameState.add({ score: 11 } as GameStateData);

    gameState.replaceLatest(newState);

    expect(gameState.get()).toEqual(newState);
    expect(gameState.get(1)).toEqual({ score: 55 });
  });

});
