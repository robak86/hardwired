import { Reader } from '../reader/reader';
import { TraitCompose } from './types/TraitCompose';

import * as R from 'ramda';
import { TraitComposeAsync } from './types/TraitComposeAsync';

// export type AsyncTrait<TBuildParams extends object, TFrom, TReturn> = Reader<TBuildParams, PromiseThunk<TFrom>> & {
//   prev?: Trait<any, any, PromiseThunk<TFrom>>;
//   // read: (from: TFrom) => TReturn;
// };

// let count = 0;

// TODO: It looks like TReturn is only used for read method!.... and provide :/
export class Trait<TBuildParams extends object, TFrom, TReturn> implements Reader<TBuildParams, TFrom> {
  static compose: TraitCompose = (...traits: Trait<any, any, any>[]): any => {
    return traits.reduce((composed, current) => composed.append(current));
  };

  static composeAsync: TraitComposeAsync = (...traits: TraitAsync<any, any, any>[]): any => {
    return traits.reduce((composed, current) => composed.append(current));
  };

  protected prev?: Trait<any, any, TFrom>;
  protected readonly run: (params: TBuildParams) => TFrom;
  readonly id: string;

  constructor(key: string, factory: (from: TBuildParams) => TReturn) {
    this.id = key;
    this.run = ctx => {
      return { ...ctx, [key]: factory(ctx) } as any;
    };
  }

  get = (value: TBuildParams): TFrom => {
    const valueToBeExtended = this.prev ? this.prev.get(value) : value;
    return this.run(valueToBeExtended);
  };

  getReplace: TraitRunReplace<TBuildParams, TFrom, TReturn> = R.curryN(2, (provides, value) => {
    const valueToBeExtended = this.prev ? this.prev.getReplace(provides, value) : value;
    return this.runReplace(provides, valueToBeExtended);
  });

  read(value: TFrom): TReturn {
    throw new Error('implement me ');
  }

  provide(value: TReturn): Reader<{}, TFrom> {
    return new Trait(this.id, _ => value) as any;
  }

  protected append(nextTrait: Trait<any, any, any>): this {
    const nextTraitClone = nextTrait.clone();
    nextTraitClone.prev = this as any;
    return nextTraitClone as any;
  }

  protected runReplace(currentProvides, value) {
    const replacedProvide = currentProvides.find(p => p.id === this.id);

    if (replacedProvide) {
      return replacedProvide.run(value) as any;
    }

    return this.run(value as any);
  }

  private clone(): Trait<TBuildParams, TFrom, TReturn> {
    return new Trait(this.id, ctx => this.run(ctx)[this.id]);
  }
}

export class TraitAsync<TBuildParams extends object, TFrom, TReturn> extends Trait<
  TBuildParams,
  Promise<TFrom>,
  Promise<TReturn>
> {
  get = async (value: TBuildParams): Promise<TFrom> => {
    const valueToBeExtended = this.prev ? await this.prev.get(value) : value;
    return this.run(valueToBeExtended);
  };

  getReplace: TraitRunReplace<TBuildParams, Promise<TFrom>, TReturn> = R.curryN(2, async (provides, value) => {
    const valueToBeExtended = this.prev ? await this.prev.getReplace(provides, value) : value;
    return this.runReplace(provides, valueToBeExtended) as any;
  });
}

export type TraitRunReplace<TBuildParams extends object, TFrom, TReturn> = {
  (provides: Reader<{}, Partial<TFrom>>[], value: TBuildParams): TFrom;
  (provides: Reader<{}, Partial<TFrom>>[]): (value: TBuildParams) => TFrom;
};
