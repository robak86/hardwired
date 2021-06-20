import { BuildStrategy } from '../../resolvers/abstract/BuildStrategy';

export type BuildStrategyFactory<TContext, TReturn> = {
  (buildFunction: (ctx: TContext) => TReturn): BuildStrategy<TReturn>;
};

// prettier-ignore
export type ExtractBuildStrategyFactoryType<T> =
  T extends <T>(buildFn: (...args:any[]) => T) => BuildStrategy<infer TType> ? TType : never
