import { buildDependencies, BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { createInstance, InstanceDefinition } from './abstract/InstanceDefinition';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';

export class TransientStrategy extends BuildStrategy {
  static type = Symbol.for('classTransient');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers,
    strategiesRegistry,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const dependencies = buildDependencies(definition, instancesCache,asyncInstancesCache, resolvers, strategiesRegistry);

        const instance = createInstance(definition, dependencies);
        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    const dependencies = buildDependencies(definition, instancesCache,asyncInstancesCache, resolvers, strategiesRegistry);
    return createInstance(definition, dependencies);
  }
}
