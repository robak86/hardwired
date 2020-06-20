import { TraitAsync } from './trait';
import { Reader } from '../reader/reader';
import { PromiseThunk } from '../utils/PromiseThunk';

/**
 * Using array of lens instead of thunk will make lens to be undefined in case of circular dependencies, but we
 * don't support circular dependencies, so it fine. We should consider adding some runtime check for undefined with
 * descriptive message though
 */

type TraitAsyncDefine<TOutput> = {
  <TKey extends string>(name: TKey, fn: (ctx: {}) => Promise<TOutput>): TraitAsync<{}, Record<TKey, TOutput>, TOutput>;

  <TKey extends string, TFrom1 extends object>(
    name: TKey,
    deps: [Reader<any, PromiseThunk<TFrom1>>],
    fn: (ctx: TFrom1) => Promise<TOutput>,
  ): TraitAsync<TFrom1, TFrom1 & Record<TKey, TOutput>, TOutput>;

  <TKey extends string, TFrom1 extends object, TFrom2 extends object>(
    name: TKey,
    deps: [Reader<any, PromiseThunk<TFrom1>>, Reader<any, PromiseThunk<TFrom2>>],
    fn: (ctx: TFrom1 & TFrom2) => Promise<TOutput>,
  ): TraitAsync<TFrom1 & TFrom2, TFrom1 & TFrom2 & Record<TKey, TOutput>, TOutput>;

  <TKey extends string, TFrom1 extends object, TFrom2 extends object, TFrom3 extends object>(
    name: TKey,
    deps: [Reader<any, PromiseThunk<TFrom1>>, Reader<any, PromiseThunk<TFrom2>>, Reader<any, PromiseThunk<TFrom3>>],
    fn: (ctx: TFrom1 & TFrom2 & TFrom3) => Promise<TOutput>,
  ): TraitAsync<TFrom1 & TFrom2 & TFrom3, TFrom1 & TFrom2 & TFrom3 & Record<TKey, TOutput>, TOutput>;
};

export const traitAsync = <T>() => {
  const define: TraitAsyncDefine<T> = (key, ...args): any => {
    if (args.length === 1) {
      const ownProvide = args[0];

      return new TraitAsync(key, ownProvide);
    }

    if (args.length === 2) {
      const ownProvide = args[1];

      return new TraitAsync(key, ownProvide);
    }

    throw new Error('something went wrong');
  };

  return { define };
};
