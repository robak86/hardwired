import { InstancesCache } from '../../context/InstancesCache';
import { ResolversRegistry } from '../../context/ResolversRegistry';
import { InstanceEntry } from '../../new/InstanceEntry';
import invariant from 'tiny-invariant';
import { InstancesDefinitionsRegistry } from "../../context/InstancesDefinitionsRegistry";

export class StrategiesRegistry {
  constructor(private strategies: Record<symbol, BuildStrategyNew>) {}

  get(key: symbol): BuildStrategyNew {
    const strategy = this.strategies[key];
    invariant(strategy, `Strategy implementation for ${key.toString()} is missing`);
    return strategy;
  }
}

export abstract class BuildStrategyNew {
  readonly tags: symbol[] = [];

  abstract build(
    definition: InstanceEntry<any>,
    context: InstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ): any;

  protected buildDependencies(
    definition: InstanceEntry<any>,
    instancesCache: InstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ) {
    return definition.dependencies.map(dep => {
      const strategy = strategiesRegistry.get(dep.strategy);
      return strategy.build(dep, instancesCache, resolvers, strategiesRegistry);
    });
  }
}
