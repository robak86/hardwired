import { isThenable } from './IsThenable.js';

export type MaybePromise<T> = T | Promise<T>;

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

export const maybePromiseThen = <T, TReturn>(
  promise: MaybePromise<T>,
  callback: (value: T) => MaybePromise<TReturn>,
): MaybePromise<TReturn> => {
  if (isThenable(promise)) {
    return (promise as Promise<T>).then(callback);
  } else {
    return callback(promise as T);
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
