import { AsyncBuildStrategy, buildAsyncInstance } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';
import { AsyncInstanceDefinition } from './abstract/AsyncInstanceDefinition';

export class AsyncSingletonStrategy extends AsyncBuildStrategy {
  static type = Symbol.for('asyncClassSingleton');

  async build(
    definition: AsyncInstanceDefinition<any, any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    definitions,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    if (definitions.hasGlobalOverrideResolver(id)) {
      return asyncInstancesCache.upsertGlobalOverrideScope(id, async () => {
        return buildAsyncInstance(definition, instancesCache, asyncInstancesCache, definitions, strategiesRegistry);
      });
    }

    return asyncInstancesCache.upsertGlobalScope(id, async () => {
      return buildAsyncInstance(definition, instancesCache, asyncInstancesCache, definitions, strategiesRegistry);
    });
  }
}
