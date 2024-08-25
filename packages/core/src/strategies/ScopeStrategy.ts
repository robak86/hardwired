import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';

export class ScopeStrategy extends BuildStrategy {
  buildFn(
    definition: BaseDefinition<any, any, any, any>,
    instancesCache: InstancesStore,
    resolvers: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
    ...args: any[]
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition, ...args);
      });
    }

    return instancesCache.upsertCurrentScope(id, () => {
      return instancesBuilder.buildExact(definition, ...args);
    });
  }
}
