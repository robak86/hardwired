import type { LifeTime } from './LifeTime.js';
import type { IDefinition } from './IDefinition.js';

export type DependenciesGraphNode = {
  definition: IDefinition<unknown, LifeTime>;
  dependencies: IDefinition<unknown, LifeTime>[];
};

export interface IDefinitionDependenciesGraph {
  get dependencies(): IDefinition<unknown, LifeTime>;

  findAll<TLifetime extends LifeTime>(lifetime: LifeTime): IDefinition<unknown, TLifetime>[];
  findOwn<TLifetime extends LifeTime>(lifetime: LifeTime): IDefinition<unknown, TLifetime>[];

  reduce<TAccumulator>(
    accumulator: TAccumulator,
    reducer: (accumulator: TAccumulator, definition: DependenciesGraphNode) => TAccumulator,
  ): TAccumulator;
}
