import { ServiceLocator } from '../container/ServiceLocator';
import { BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class ServiceLocatorResolver extends BuildStrategy<ServiceLocator> {
  constructor() {
    super();
  }

  build(id: string, context: InstancesCache, resolvers): ServiceLocator {
    if (context.hasInGlobalScope(id)) {
      return context.getFromGlobalScope(id);
    } else {
      const instance = new ServiceLocator(context, resolvers);
      context.setForGlobalScope(id, instance);
      return instance;
    }
  }
}

export const serviceLocator = (): BuildStrategy<ServiceLocator> => new ServiceLocatorResolver();
