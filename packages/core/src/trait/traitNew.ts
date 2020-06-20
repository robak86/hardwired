import { Trait } from './trait';
import { Reader } from '../reader/reader';

/**
 * Using array of lens instead of thunk will make lens to be undefined in case of circular dependencies, but we
 * don't support circular dependencies, so it fine. We should consider adding some runtime check for undefined with
 * descriptive message though
 */

type TraitDefine<TOutput> = {
  <TKey extends string>(name: TKey, fn: (ctx: {}) => TOutput): Trait<{}, Record<TKey, TOutput>, TOutput>;

  <TKey extends string, TFrom1 extends object>(
    name: TKey,
    deps: [Reader<any, TFrom1>],
    fn: (ctx: TFrom1) => TOutput,
  ): Trait<TFrom1, TFrom1 & Record<TKey, TOutput>, TOutput>;

  <TKey extends string, TFrom1 extends object, TFrom2 extends object>(
    name: TKey,
    deps: [Reader<any, TFrom1>, Reader<any, TFrom2>],
    fn: (ctx: TFrom1 & TFrom2) => TOutput,
  ): Trait<TFrom1 & TFrom2, TFrom1 & TFrom2 & Record<TKey, TOutput>, TOutput>;

  <TKey extends string, TFrom1 extends object, TFrom2 extends object, TFrom3 extends object>(
    name: TKey,
    deps: [Reader<any, TFrom1>, Reader<any, TFrom2>, Reader<any, TFrom3>],
    fn: (ctx: TFrom1 & TFrom2 & TFrom3) => TOutput,
  ): Trait<TFrom1 & TFrom2 & TFrom3, TFrom1 & TFrom2 & TFrom3 & Record<TKey, TOutput>, TOutput>;
};

export const trait = <T>() => {
  const define: TraitDefine<T> = (key, ...args): any => {
    if (args.length === 1) {
      const ownProvide = args[0];

      return new Trait(key, ownProvide);
    }

    if (args.length === 2) {
      const ownProvide = args[1];

      return new Trait(key, ownProvide);
    }

    throw new Error('something went wrong');
  };

  return { define };
};

const a = trait<number>().define('a', ctx => 123);
