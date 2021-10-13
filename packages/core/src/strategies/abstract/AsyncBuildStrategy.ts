import { AnyInstanceDefinition } from "../../definitions/abstract/AnyInstanceDefinition";
import { InstancesCache } from "../../context/InstancesCache";
import { AsyncInstancesCache } from "../../context/AsyncInstancesCache";
import { InstancesDefinitionsRegistry } from "../../context/InstancesDefinitionsRegistry";
import { InstancesBuilder } from "../../context/abstract/InstancesBuilder";

export abstract class AsyncBuildStrategy {
    abstract build(
        definition: AnyInstanceDefinition<any, any>,
        instancesCache: InstancesCache,
        asyncInstancesCache: AsyncInstancesCache,
        resolvers: InstancesDefinitionsRegistry,
        instancesBuilder: InstancesBuilder,
    ): Promise<any>;
}
