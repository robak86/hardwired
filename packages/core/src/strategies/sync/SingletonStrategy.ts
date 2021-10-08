import { BuildStrategy } from '../abstract/BuildStrategy';
import { InstancesCache } from '../../context/InstancesCache';
import { InstanceDefinition } from '../../definitions/InstanceDefinition';
import { StrategiesRegistry } from '../collection/StrategiesRegistry';
import { AsyncInstancesCache } from '../../context/AsyncInstancesCache';
import { InstancesBuilder } from '../../context/InstancesBuilder';

export class SingletonStrategy extends BuildStrategy {
  static type = Symbol.for('classSingleton');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers,
    instancesBuilder: InstancesBuilder,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return instancesCache.upsertGlobalScope(id, () => {
      return instancesBuilder.buildExact(definition);
    });
  }
}
