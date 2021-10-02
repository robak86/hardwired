import { ServiceLocator } from '../container/ServiceLocator';
import { InstancesCache } from '../context/InstancesCache';
import { BuildStrategy } from './abstract/BuildStrategy';
import { BuildStrategyNew, StrategiesRegistry } from './abstract/_BuildStrategy';
import { InstanceEntry } from "../new/InstanceEntry";
import { InstancesDefinitionsRegistry } from "../context/InstancesDefinitionsRegistry";

export class ServiceLocatorStrategy extends BuildStrategyNew {
  static type = Symbol.for('serviceLocatorStrategy');

  constructor() {
    super();
  }

  build(
      definition: InstanceEntry<any>,
      context: InstancesCache,
      resolvers: InstancesDefinitionsRegistry,
      strategiesRegistry: StrategiesRegistry,
  ) {

    const id = definition.id

    if (context.hasInGlobalScope(id)) {
      return context.getFromGlobalScope(id);
    } else {
      const instance = new ServiceLocator(context, resolvers);
      context.setForGlobalScope(id, instance);
      return instance;
    }
  }

}

// export const serviceLocator = (): BuildStrategy<ServiceLocator> => new ServiceLocatorStrategy();
