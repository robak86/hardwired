import { ServiceLocator } from '../container/ServiceLocator';
import { InstancesCache } from '../context/InstancesCache';
import { BuildStrategy } from './abstract/BuildStrategy';
import { InstanceDefinition } from '../definitions/InstanceDefinition';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry';
import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';

export class ServiceLocatorStrategy extends BuildStrategy {
  static type = Symbol.for('serviceLocatorStrategy');

  constructor() {
    super();
  }

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    return instancesCache.upsertGlobalScope(id, () => {
      return new ServiceLocator(instancesCache, asyncInstancesCache, resolvers);
    });
  }
}
