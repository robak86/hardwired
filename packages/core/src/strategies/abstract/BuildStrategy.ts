import { InstancesStore } from '../../context/InstancesStore';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry';
import { AnyInstanceDefinition } from '../../definitions/abstract/AnyInstanceDefinition';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder';

// TODO: Ideally build strategy should be just static object with type and build property (to decrease chances that one will make it stateful)
export abstract class BuildStrategy {
  abstract build(
    definition: AnyInstanceDefinition<any, any, any>,
    instancesCache: InstancesStore,
    resolvers: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
  ): any;
}
