import { BuildStrategy} from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { createInstance, InstanceDefinition } from '../new/InstanceDefinition';
import { StrategiesRegistry } from "./collection/StrategiesRegistry";

export class RequestStrategy extends BuildStrategy {
  static type = Symbol.for('classRequest');

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

    if (instancesCache.hasInRequestScope(id)) {
      return instancesCache.getFromRequestScope(id);
    } else {
      const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
      const instance = createInstance(definition, dependencies);
      instancesCache.setForRequestScope(id, instance);
      return instance;
    }
  }
}
