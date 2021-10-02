import { BuildStrategy} from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { createInstance, InstanceDefinition } from './abstract/InstanceDefinition';
import { StrategiesRegistry } from "./collection/StrategiesRegistry";

export class SingletonStrategy extends BuildStrategy {
  static type = Symbol.for('classSingleton');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
        const instance = createInstance(definition, dependencies);

        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    if (instancesCache.hasInGlobalScope(id)) {
      return instancesCache.getFromGlobalScope(id);
    } else {
      const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
      const instance = createInstance(definition, dependencies);
      instancesCache.setForGlobalScope(id, instance);
      return instance;
    }
  }
}
