import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';

import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';

export class ScopeStrategy extends BuildStrategy {
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

    return instancesStore.upsertCurrentScope(id, () => {
      return instancesBuilder.buildExact(definition, ...args);
    });
  }
}
