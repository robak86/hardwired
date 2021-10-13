import { InstancesCache } from '../../context/InstancesCache';
import { AsyncInstancesCache } from '../../context/AsyncInstancesCache';
import { AsyncInstanceDefinition } from '../../definitions/abstract/AsyncInstanceDefinition';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder';
import { AsyncBuildStrategy } from '../abstract/AsyncBuildStrategy';

export class AsyncTransientStrategy extends AsyncBuildStrategy {
  static type = Symbol.for('asyncTransientStrategy');

  async build(
    definition: AsyncInstanceDefinition<any, any>,
    _: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    definitions,
    instancesBuilder: InstancesBuilder,
  ): Promise<any> {
    const id = definition.id;

    if (definitions.hasGlobalOverrideDefinition(id)) {
      return asyncInstancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return instancesBuilder.buildExact(definition);
  }
}
