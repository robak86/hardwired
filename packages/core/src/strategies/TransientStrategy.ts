import { buildDependencies, buildInstance, BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { InstanceDefinition } from './abstract/InstanceDefinition';
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
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return buildInstance(definition, instancesCache, asyncInstancesCache, resolvers, strategiesRegistry);
      });
    }

    return buildInstance(definition, instancesCache, asyncInstancesCache, resolvers, strategiesRegistry);
  }
}
