import { InstancesStore } from '../../context/InstancesStore.js';
import { BindingsRegistry } from '../../context/BindingsRegistry.js';

import { InstancesBuilder } from '../../context/abstract/InstancesBuilder.js';

import { Definition } from '../../definitions/abstract/Definition.js';

export abstract class BuildStrategy {
  abstract buildFn(
    definition: Definition<any, any, any>,
    instancesStore: InstancesStore,
    bindingsRegistry: BindingsRegistry,
    instancesBuilder: InstancesBuilder,
    ...args: any[]
  ): any;
}
