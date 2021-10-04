import { buildInstance, BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { InstanceDefinition } from './abstract/InstanceDefinition';
import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';

export class SingletonStrategy extends BuildStrategy {
  static type = Symbol.for('classSingleton');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return buildInstance(definition, instancesCache, asyncInstancesCache, resolvers, strategiesRegistry);
      });
    }

    return instancesCache.upsertGlobalScope(id, () => {
      return buildInstance(definition, instancesCache, asyncInstancesCache, resolvers, strategiesRegistry);
    });
  }
}
