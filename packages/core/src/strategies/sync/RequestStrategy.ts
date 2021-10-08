import { BuildStrategy } from '../abstract/BuildStrategy';
import { InstancesCache } from '../../context/InstancesCache';
import { InstanceDefinition } from '../../definitions/abstract/InstanceDefinition';
import { AsyncInstancesCache } from '../../context/AsyncInstancesCache';

export class RequestStrategy extends BuildStrategy {
  static type = Symbol.for('classRequest');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers,
    instancesBuilder
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return instancesCache.upsertRequestScope(id, () => {
      return instancesBuilder.buildExact(definition);
    });
  }
}
