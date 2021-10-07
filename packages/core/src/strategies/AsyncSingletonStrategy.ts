import { AsyncBuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';
import { AsyncInstanceDefinition } from '../definitions/AsyncInstanceDefinition';
import { InstancesBuilder } from '../context/InstancesBuilder';

export class AsyncSingletonStrategy extends AsyncBuildStrategy {
  static type = Symbol.for('asyncClassSingleton');

  async build(
    definition: AsyncInstanceDefinition<any, any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    definitions,
    instancesBuilder: InstancesBuilder,
  ): Promise<any> {
    const id = definition.id;

    if (definitions.hasGlobalOverrideResolver(id)) {
      return asyncInstancesCache.upsertGlobalOverrideScope(id, async () => {
        return instancesBuilder.buildSelf(definition);
      });
    }

    return asyncInstancesCache.upsertGlobalScope(id, async () => {
      return instancesBuilder.buildSelf(definition);
    });
  }
}
