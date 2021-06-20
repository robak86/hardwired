import { Instance } from '../../resolvers/abstract/Instance';

export type BuildStrategyFactory<TContext, TReturn> = {
  (buildFunction: (ctx: TContext) => TReturn): Instance<TReturn>;
};

// prettier-ignore
export type ExtractBuildStrategyFactoryType<T> =
  T extends <T>(buildFn: (...args:any[]) => T) => Instance<infer TType> ? TType : never
