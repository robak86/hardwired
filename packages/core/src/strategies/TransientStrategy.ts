import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';

export class TransientStrategy extends BuildStrategy {
  buildFn(
    definition: BaseDefinition<any, any, any, any>,
    instancesCache: InstancesStore,
    definitions: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
  ) {
    const id = definition.id;

    if (definitions.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExactFn(definition);
      });
    }

    return instancesBuilder.buildExactFn(definition);
  }
}
