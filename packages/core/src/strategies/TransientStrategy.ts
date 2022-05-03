import { BuildStrategy } from './abstract/BuildStrategy';
import { InstancesStore } from '../context/InstancesStore';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder';

export class TransientStrategy extends BuildStrategy {
  build(
    definition: InstanceDefinition<any, any>,
    instancesCache: InstancesStore,
    definitions,
    instancesBuilder: InstancesBuilder,
  ) {
    const id = definition.id;

    if (definitions.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return instancesBuilder.buildExact(definition);
  }
}
