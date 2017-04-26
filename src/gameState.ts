const LAST = -1;

export enum GameStatus { initial, game, gameOver, autoRewind }

export interface GameStateValue<T> {
  order: number;
  data: T;
}

export class GameState<T> {
  private counter = 0;
  values: GameStateValue<T>[] = [];

  constructor (
    private poolSize: number,
    private initialGameState: T
  ) {
    this.reset();
  }

  add (value: T) {
    const newValue = {
      order: this.counter,
      data: value
    };

    this.counter += 1;

    if (this.poolSize === this.values.length) {
      Object.assign(this.values[this.values.length - 1], newValue);
      this.values.sort( (valA, valB) => valB.order - valA.order );
    } else {
      this.values.unshift(newValue);
    }
  }

  get (index = 0) {
    const value = this.values[index];

    if (!value) {
      return this.values[0].data;
    }

    return value.data;
  }

  use (index = 0) {
    const value = this.values[index]
      ? this.values[index]
      : this.values[0];

    if (value.order === -1) {
      return false;
    }

    value.order = LAST;
    this.values.sort( (valA, valB) => valB.order - valA.order );

    return value.data;
  }

  replaceLatest (value: T) {
    this.values[0].data = value;
  }

  reset () {
    this.counter = 0;
    this.values = [];
    for (let i = 0; i < this.poolSize; i += 1) {
      this.values.push({
        order: LAST,
        data: this.initialGameState
      });
    }
  }
}
