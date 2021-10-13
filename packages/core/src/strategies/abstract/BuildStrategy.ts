import { InstancesCache } from '../../context/InstancesCache';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry';
import { AnyInstanceDefinition } from '../../definitions/abstract/AnyInstanceDefinition';
import { AsyncInstancesCache } from '../../context/AsyncInstancesCache';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder';

// TODO: Ideally build strategy should be just static object with type and build property (to decrease chances that one will make it stateful)
export abstract class BuildStrategy {
  abstract build(
    definition: AnyInstanceDefinition<any, any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache, // only required by service locator because we would like to obtain service locator synchronously and then get some async definitions
    resolvers: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
  ): any;
}

