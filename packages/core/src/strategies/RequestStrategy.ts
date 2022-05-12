import { BuildStrategy } from './abstract/BuildStrategy';
import { InstancesStore } from '../context/InstancesStore';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry';
import { InstancesBuilder } from "../context/abstract/InstancesBuilder";

export class RequestStrategy extends BuildStrategy {
  build(
    definition: InstanceDefinition<any, any, any>,
    instancesCache: InstancesStore,
    resolvers: InstancesDefinitionsRegistry,
    instancesBuilder:InstancesBuilder,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return instancesCache.upsertRequestScope(id, () => {
      return instancesBuilder.buildExact(definition);
    });
  }
}
