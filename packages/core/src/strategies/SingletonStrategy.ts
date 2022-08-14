import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry.js';

export class SingletonStrategy extends BuildStrategy {
  build(
    definition: InstanceDefinition<any, any>,
    instancesCache: InstancesStore,
    definitionsRegistry: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
  ) {
    const id = definition.id;

    if (definitionsRegistry.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return instancesCache.upsertGlobalScope(id, () => {
      return instancesBuilder.buildExact(definition);
    });
  }
}
