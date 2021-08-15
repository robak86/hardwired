import { InstancesCache } from '../../context/InstancesCache';
import { ResolversRegistry } from '../../context/ResolversRegistry';

export namespace BuildStrategy {
  export type Unbox<T> = T extends BuildStrategy<infer TInstance>
    ? TInstance
    : 'Cannot unbox instance type from Instance';
}

export abstract class BuildStrategy<TValue> {
  readonly __TValue!: TValue; // prevent generic type erasure
  readonly tags: symbol[] = [];

  abstract build(id: string, context: InstancesCache, resolvers: ResolversRegistry, materializedModule?): TValue;
}

export type BuildStrategyFactory<TContext, TReturn> = {
  (buildFunction: (ctx: TContext) => TReturn): BuildStrategy<TReturn>;
};
