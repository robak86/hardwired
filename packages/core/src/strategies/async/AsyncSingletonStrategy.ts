import { InstancesCache } from '../../context/InstancesCache';
import { AsyncInstancesCache } from '../../context/AsyncInstancesCache';
import { AsyncInstanceDefinition } from '../../definitions/abstract/AsyncInstanceDefinition';
import { InstancesBuilder } from '../../context/InstancesBuilder';
import { AsyncBuildStrategy } from "../abstract/AsyncBuildStrategy";

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

    if (definitions.hasGlobalOverrideDefinition(id)) {
      return asyncInstancesCache.upsertGlobalOverrideScope(id, async () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return asyncInstancesCache.upsertGlobalScope(id, async () => {
      return instancesBuilder.buildExact(definition);
    });
  }
}
