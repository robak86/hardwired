import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';

export class SingletonStrategy extends BuildStrategy {
  build(
    definition: AnyInstanceDefinition<any, any, any>,
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

  buildFn(
    definition: BaseDefinition<any, any, any, any>,
    instancesCache: InstancesStore,
    definitionsRegistry: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
  ) {
    const id = definition.id;

    if (definitionsRegistry.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExactFn(definition);
      });
    }

    return instancesCache.upsertGlobalScope(id, () => {
      return instancesBuilder.buildExactFn(definition);
    });
  }
}
