import { BuildStrategy } from '../abstract/BuildStrategy';
import { InstancesStore } from '../../context/InstancesStore';
import { InstanceDefinition } from '../../definitions/abstract/InstanceDefinition';
import { AsyncInstancesStore } from '../../context/AsyncInstancesStore';

export class ScopeStrategy extends BuildStrategy {

  build(
    definition: InstanceDefinition<any, any>,
    instancesCache: InstancesStore,
    asyncInstancesCache: AsyncInstancesStore,
    resolvers,
    instancesBuilder,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return instancesCache.upsertCurrentScope(id, () => {
      return instancesBuilder.buildExact(definition);
    });
  }
}
