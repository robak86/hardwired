import { BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { InstanceDefinition } from '../definitions/InstanceDefinition';
import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';

export class RequestStrategy extends BuildStrategy {
  static type = Symbol.for('classRequest');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
    instancesBuilder
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildSelf(definition);
      });
    }

    return instancesCache.upsertRequestScope(id, () => {
      return instancesBuilder.buildSelf(definition);
    });
  }
}
