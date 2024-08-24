import { BuildStrategy } from './abstract/BuildStrategy.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { IDefinition } from '../definitions/abstract/FnDefinition.js';

export class ScopeStrategy extends BuildStrategy {
  build(
    definition: InstanceDefinition<any, any, any>,
    instancesCache: InstancesStore,
    resolvers: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExact(definition);
      });
    }

    return instancesCache.upsertCurrentScope(id, () => {
      return instancesBuilder.buildExact(definition);
    });
  }

  buildFn(
    definition: IDefinition<any, any, any>,
    instancesCache: InstancesStore,
    resolvers: InstancesDefinitionsRegistry,
    instancesBuilder: InstancesBuilder,
  ) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideDefinition(id)) {
      return instancesCache.upsertGlobalOverrideScope(id, () => {
        return instancesBuilder.buildExactFn(definition);
      });
    }

    return instancesCache.upsertCurrentScope(id, () => {
      return instancesBuilder.buildExactFn(definition);
    });
  }
}
