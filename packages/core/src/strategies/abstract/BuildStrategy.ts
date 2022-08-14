import { InstancesStore } from '../../context/InstancesStore.js';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry.js';
import { AnyInstanceDefinition } from '../../definitions/abstract/AnyInstanceDefinition.js';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder.js';

// TODO: Ideally build strategy should be just static object with type and build property (to decrease chances that one will make it stateful)
export abstract class BuildStrategy {
  abstract build(
    definition: AnyInstanceDefinition<any, any>,
    instancesCache: InstancesStore,
    resolvers: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
  ): any;
}
