import { ServiceLocator } from '../container/ServiceLocator';
import { InstancesCache } from '../context/InstancesCache';
import { BuildStrategy} from './abstract/BuildStrategy';
import { InstanceDefinition } from './abstract/InstanceDefinition';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry';
import { StrategiesRegistry } from "./collection/StrategiesRegistry";

export class ServiceLocatorStrategy extends BuildStrategy {
  static type = Symbol.for('serviceLocatorStrategy');

  constructor() {
    super();
  }

  build(
    definition: InstanceDefinition<any>,
    context: InstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const id = definition.id;

    if (context.hasInGlobalScope(id)) {
      return context.getFromGlobalScope(id);
    } else {
      const instance = new ServiceLocator(context, resolvers);
      context.setForGlobalScope(id, instance);
      return instance;
    }
  }
}
