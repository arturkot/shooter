const LAST = -1;

export enum GameStatus { initial, game, gameOver, autoRewind }

export interface GameStateValue<T> {
  order: number;
  data: T | T[];
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

  add (newData: T) {
    this.counter += 1;

    if (this.poolSize === this.values.length) {
      const prevValue = this.values[this.values.length - 1];
      const { data } = prevValue;

      if ( Array.isArray(newData) ) {
        const dataArr = data as T[];
        dataArr.forEach( (item, index) => {
          Object.assign(item, newData[index]);
        });
      } else {
        Object.assign(data, newData);
      }
      prevValue.order = this.counter;

      this.values.sort( (valA, valB) => valB.order - valA.order );
    } else {
      const newValue = {
        order: this.counter,
        data: newData
      };

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

  replaceLatest (data: T) {
    this.values[0].data = data;
  }

  reset () {
    this.counter = 0;
    this.values = [];

    for (let i = 0; i < this.poolSize; i += 1) {
      this.values.push({
        order: LAST,
        data: this.createInitialData(this.initialGameState)
      });
    }
  }

  align (keyName: string, alignValue: any) {
    const { values } = this;
    const isArrays = Array.isArray(values[0].data);

    if (isArrays) {
      const matchedItemIndexes = new Set();

      values.forEach( value => {
        const data = value.data as T[];

        data.forEach( (item: { [key: string]: any}, index) => {
          const itemValue = item[keyName];

          if (itemValue === alignValue) {
            matchedItemIndexes.add(index);
          }
        });
      });

      values.forEach( value => {
        const data = value.data as T[];

        matchedItemIndexes.forEach( index => {
          const item = data[index] as { [key: string]: any};
          item[keyName] = alignValue;
        });
      });
    } else {
      const isAlignValuePresent = values.some( value => {
        const item = value.data as { [key: string]: any};
        return item[keyName] === alignValue;
      });

      if (isAlignValuePresent) {
        values.forEach( value => {
          const item = value.data as { [key: string]: any};
          item[keyName] = alignValue;
        });
      }
    }
  }

  private createInitialData (data: T) {
    if ( Array.isArray(data) ) {
      const dataArr = data as T[];

      return dataArr.map( (item, index) => {
        return Object.assign({}, item, data[index]);
      });
    }

    return Object.assign({}, data);
  }
}
