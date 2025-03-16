import { isPromise } from './IsPromise.js';

export type MaybePromiseValue<T> = T | Promise<T>;

export class MaybePromise<T> {
  private readonly value: MaybePromiseValue<T>;

  private constructor(value: MaybePromiseValue<T>) {
    this.value = value;
  }

  static of<T>(value: MaybePromiseValue<T>): MaybePromise<T> {
    return new MaybePromise(value);
  }

  static all<T>(values: MaybePromiseValue<T>[]): MaybePromise<T[]> {
    const hasAsync = values.some(isPromise);
    const result = hasAsync ? Promise.all(values) : (values as T[]);

    return new MaybePromise(result);
  }

  map<R>(fn: (value: T) => R): MaybePromise<R> {
    if (isPromise(this.value)) {
      return new MaybePromise(this.value.then(fn));
    } else {
      return new MaybePromise(fn(this.value));
    }
  }

  flatMap<R>(fn: (value: T) => MaybePromiseValue<R>): MaybePromise<R> {
    if (isPromise(this.value)) {
      return new MaybePromise(
        this.value.then(value => {
          const result = fn(value);

          return isPromise(result) ? result : Promise.resolve(result);
        }),
      );
    } else {
      const result = fn(this.value);

      return new MaybePromise(result);
    }
  }

  tap(fn: (value: T) => void): MaybePromise<T> {
    if (isPromise(this.value)) {
      return new MaybePromise(
        this.value.then(value => {
          fn(value);

          return value;
        }),
      );
    } else {
      fn(this.value);

      return this;
    }
  }

  get(): MaybePromiseValue<T> {
    return this.value;
  }

  asPromise(): Promise<T> {
    return isPromise(this.value) ? this.value : Promise.resolve(this.value);
  }
}

export const maybePromise = <T>(value: MaybePromiseValue<T>): MaybePromise<T> => {
  return MaybePromise.of(value);
};

export const maybePromiseAll = <T>(values: MaybePromiseValue<T>[]): MaybePromise<T[]> => {
  return MaybePromise.all(values);
};
