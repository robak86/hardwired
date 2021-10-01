import { BuildStrategyNew, StrategiesRegistry } from './abstract/_BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { FunctionFactoryDefinition, InstanceEntry } from '../new/InstanceEntry';

export class FactoryFunctionSingletonStrategy extends BuildStrategyNew {
  static type = Symbol.for('functionFactory');

  build(
    definition: FunctionFactoryDefinition<any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;
    const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);

    const buildFunction = () => definition.factory(...dependencies);

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const instance = buildFunction();
        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    if (instancesCache.hasInGlobalScope(id)) {
      return instancesCache.getFromGlobalScope(id);
    } else {
      const instance = buildFunction();
      instancesCache.setForGlobalScope(id, instance);
      return instance;
    }
  }
}
