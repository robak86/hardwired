import { AnyInstanceDefinition } from "../../definitions/abstract/AnyInstanceDefinition";
import { InstancesStore } from "../../context/InstancesStore";
import { AsyncInstancesStore } from "../../context/AsyncInstancesStore";
import { InstancesDefinitionsRegistry } from "../../context/InstancesDefinitionsRegistry";
import { InstancesBuilder } from "../../context/abstract/InstancesBuilder";

export abstract class AsyncBuildStrategy {
    abstract build(
        definition: AnyInstanceDefinition<any, any>,
        instancesCache: InstancesStore,
        asyncInstancesCache: AsyncInstancesStore,
        resolvers: InstancesDefinitionsRegistry,
        instancesBuilder: InstancesBuilder,
    ): Promise<any>;
}
