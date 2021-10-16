import { InstancesStore } from '../../context/InstancesStore';
import { AsyncInstancesStore } from '../../context/AsyncInstancesStore';
import { AsyncInstanceDefinition } from '../../definitions/abstract/AsyncInstanceDefinition';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder';
import { AsyncBuildStrategy } from '../abstract/AsyncBuildStrategy';

export class AsyncSingletonStrategy extends AsyncBuildStrategy {

  async build(
    definition: AsyncInstanceDefinition<any, any, any>,
    _: InstancesStore,
    asyncInstancesCache: AsyncInstancesStore,
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
