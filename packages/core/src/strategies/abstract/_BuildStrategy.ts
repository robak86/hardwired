import { InstancesCache } from '../../context/InstancesCache';
import { InstanceEntry } from '../../new/InstanceEntry';
import invariant from 'tiny-invariant';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry';

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
    definition: InstanceEntry<any>, // TODO: use correct type
    instancesCache: InstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ) {
    if (definition.kind === 'const' || definition.kind === 'decorator') {
      return [];
    }

    return (definition.dependencies ?? []).map(dep => {
      const strategy = strategiesRegistry.get(dep.strategy);
      return strategy.build(dep, instancesCache, resolvers, strategiesRegistry);
    });
  }
}
