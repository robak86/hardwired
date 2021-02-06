import { Instance } from '../../resolvers/abstract/Instance';

export abstract class BuildStrategy<TValue> extends Instance<TValue> {
  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }
}

export type BuildStrategyFactory<TContext, TReturn> = {
  (buildFunction: (ctx: TContext) => TReturn): BuildStrategy<TReturn>;
};

// prettier-ignore
export type ExtractBuildStrategyFactoryType<T> =
  T extends <T>(buildFn: (...args:any[]) => T) => BuildStrategy<infer TType> ? TType : never
