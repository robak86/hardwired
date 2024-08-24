import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';

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

  buildFn(
    definition: BaseDefinition<any, any, any>,
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
