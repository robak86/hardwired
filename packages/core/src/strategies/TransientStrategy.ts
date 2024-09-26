import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';

import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';

export class TransientStrategy extends BuildStrategy {
  buildFn(
    definition: BaseDefinition<any, any, any, any>,
    instancesStore: InstancesStore,
    bindingsRegistry: BindingsRegistry,
    instancesBuilder: InstancesBuilder,
    ...args: any[]
  ) {
    const id = definition.id;

    if (bindingsRegistry.hasFinalBinding(id)) {
      return instancesStore.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition, ...args);
      });
    }

    return instancesBuilder.buildExact(definition, ...args);
  }
}
