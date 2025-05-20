import { isThenable } from './IsThenable.js';

export type MaybePromise<T> = T | Promise<T>;

export class MaybePromiseBox<T> {
  private readonly value: MaybePromise<T>;

  constructor(value: MaybePromise<T>) {
    this.value = value;
  }

  static of<T>(value: MaybePromise<T>): MaybePromiseBox<T> {
    return new MaybePromiseBox(value);
  }

  map<U>(fn: (value: T) => U): MaybePromiseBox<U> {
    if (this.value instanceof Promise) {
      return new MaybePromiseBox(this.value.then(fn));
    } else {
      return new MaybePromiseBox(fn(this.value));
    }
  }

  flatMap<U>(fn: (value: T) => MaybePromise<U>): MaybePromiseBox<U> {
    if (this.value instanceof Promise) {
      return new MaybePromiseBox(this.value.then(fn).then(MaybePromiseBox.unwrap));
    } else {
      const result = fn(this.value);

      return new MaybePromiseBox(result);
    }
  }

  // Get raw value (maybe async)
  unwrap(): MaybePromise<T> {
    return this.value;
  }

  // For consistent promise resolution
  async toPromise(): Promise<T> {
    return await this.value;
  }

  static async all<T>(items: MaybePromiseBox<T>[]): Promise<T[]> {
    const promises = items.map(item => item.toPromise());

    return Promise.all(promises);
  }

  // unwrap nested MaybePromise in flatMap
  private static unwrap<T>(value: MaybePromise<T>): T | Promise<T> {
    return value;
  }
}

export const maybePromiseAllThen = <T, TReturn>(
  promises: MaybePromise<T>[],
  callback: (values: T[]) => TReturn,
): MaybePromise<TReturn> => {
  const hasAsync = promises.some(isThenable);

  if (hasAsync) {
    return Promise.all(promises).then(callback);
  } else {
    return callback(promises as T[]);
  }
};

export const maybePromiseAll = <T>(promises: MaybePromise<T>[]): MaybePromise<T[]> => {
  const hasAsync = promises.some(isThenable);

  if (hasAsync) {
    return Promise.all(promises);
  } else {
    return promises as T[];
  }
};
