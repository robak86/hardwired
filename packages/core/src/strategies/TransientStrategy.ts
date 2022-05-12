import { BuildStrategy } from './abstract/BuildStrategy';
import { InstancesStore } from '../context/InstancesStore';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry';

export class TransientStrategy extends BuildStrategy {
  build(
    definition: InstanceDefinition<any, any, any>,
    instancesCache: InstancesStore,
    definitions: InstancesDefinitionsRegistry,
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
