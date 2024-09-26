import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry.js';

import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';

export class SingletonStrategy extends BuildStrategy {
  buildFn(
    definition: BaseDefinition<any, any, any, any>,
    instancesCache: InstancesStore,
    definitionsRegistry: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
    ...args: any[]
  ) {
    const id = definition.id;

    if (definitionsRegistry.hasFinalBinding(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition, ...args);
      });
    }

    return instancesCache.upsertGlobalScope(id, () => {
      return instancesBuilder.buildExact(definition, ...args);
    });
  }
}
