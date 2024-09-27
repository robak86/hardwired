import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';

import { Definition } from '../definitions/abstract/Definition.js';

export class SingletonStrategy extends BuildStrategy {
  buildFn(
    definition: Definition<any, any, any>,
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

    return instancesStore.upsertGlobalScope(id, () => {
      return instancesBuilder.buildExact(definition, ...args);
    });
  }
}
