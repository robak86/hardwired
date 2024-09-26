import { InstancesStore } from '../../context/InstancesStore.js';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry.js';

import { InstancesBuilder } from '../../context/abstract/InstancesBuilder.js';

import { BaseDefinition } from '../../definitions/abstract/BaseDefinition.js';

// TODO: Ideally build strategy should be just static object with type and build property (to decrease chances that one will make it stateful)
export abstract class BuildStrategy {
  abstract buildFn(
    definition: BaseDefinition<any, any, any, any>,
    instancesCache: InstancesStore,
    resolvers: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
    ...args: any[]
  ): any;
}
