import { buildDependencies, BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { InstanceDefinition } from './abstract/InstanceDefinition';
import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';

export class RequestStrategy extends BuildStrategy {
  static type = Symbol.for('classRequest');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const dependencies = buildDependencies(
          definition,
          instancesCache,
          asyncInstancesCache,
          resolvers,
          strategiesRegistry,
        );
        const instance = definition.create(dependencies);

        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    if (instancesCache.hasInRequestScope(id)) {
      return instancesCache.getFromRequestScope(id);
    } else {
      const dependencies = buildDependencies(
        definition,
        instancesCache,
        asyncInstancesCache,
        resolvers,
        strategiesRegistry,
      );
      const instance = definition.create(dependencies);
      instancesCache.setForRequestScope(id, instance);
      return instance;
    }
  }
}
