import { BuildStrategy } from '../../resolvers/abstract/BuildStrategy';

export type BuildStrategyFactory<TContext, TReturn> = {
  (buildFunction: (ctx: TContext) => TReturn): BuildStrategy<TReturn>;
};
