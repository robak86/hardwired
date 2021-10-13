import { ServiceLocator } from '../container/ServiceLocator';
import { InstancesStore } from '../context/InstancesStore';
import { BuildStrategy } from './abstract/BuildStrategy';
import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry';
import { AsyncInstancesStore } from '../context/AsyncInstancesStore';

export class ServiceLocatorStrategy extends BuildStrategy {
  static type = Symbol.for('serviceLocatorStrategy');

  constructor() {
    super();
  }

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesStore,
    asyncInstancesCache: AsyncInstancesStore,
    resolvers: InstancesDefinitionsRegistry,
  ) {
    const id = definition.id;

    return instancesCache.upsertGlobalScope(id, () => {
      return new ServiceLocator(instancesCache, asyncInstancesCache, resolvers);
    });
  }
}
