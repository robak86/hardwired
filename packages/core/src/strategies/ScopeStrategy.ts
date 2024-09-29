import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';

import { Definition } from '../definitions/abstract/Definition.js';

export class ScopeStrategy extends BuildStrategy {
  buildFn(
    definition: Definition<any, any, any>,
    instancesStore: InstancesStore,
    bindingsRegistry: BindingsRegistry,
    instancesBuilder: InstancesBuilder,
    ...args: any[]
  ) {
    const id = definition.id;

    if (bindingsRegistry.hasFrozenBinding(id)) {
      return instancesStore.upsertIntoFrozenInstances(id, () => {
        return instancesBuilder.buildExact(definition, ...args);
      });
    }

    return instancesStore.upsertIntoScopeInstances(id, () => {
      return instancesBuilder.buildExact(definition, ...args);
    });
  }
}
