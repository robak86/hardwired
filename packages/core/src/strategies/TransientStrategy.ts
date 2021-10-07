import { BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { InstanceDefinition } from '../definitions/InstanceDefinition';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';
import { InstancesBuilder } from '../context/InstancesBuilder';

export class TransientStrategy extends BuildStrategy {
  static type = Symbol.for('classTransient');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers,
    instancesBuilder: InstancesBuilder,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildSelf(definition);
      });
    }

    return instancesBuilder.buildSelf(definition);
  }
}
