import { BuildStrategy } from '../abstract/BuildStrategy';
import { InstancesStore } from '../../context/InstancesStore';
import { InstanceDefinition } from '../../definitions/abstract/InstanceDefinition';
import { AsyncInstancesStore } from '../../context/AsyncInstancesStore';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder';



export class SingletonStrategy extends BuildStrategy {

  build(
    definition: InstanceDefinition<any, any>,
    instancesCache: InstancesStore,
    asyncInstancesCache: AsyncInstancesStore,
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
