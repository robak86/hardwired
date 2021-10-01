import { ServiceLocator } from '../container/ServiceLocator';
import { InstancesCache } from '../context/InstancesCache';
import { BuildStrategy } from './abstract/BuildStrategy';

export class ServiceLocatorStrategy extends BuildStrategy<ServiceLocator> {
  constructor() {
    super();
  }

  build(id: string, context: InstancesCache, resolvers): ServiceLocator {
    throw new Error("Implement me!")
    // if (context.hasInGlobalScope(id)) {
    //   return context.getFromGlobalScope(id);
    // } else {
    //   const instance = new ServiceLocator(context, resolvers);
    //   context.setForGlobalScope(id, instance);
    //   return instance;
    // }
  }
}

export const serviceLocator = (): BuildStrategy<ServiceLocator> => new ServiceLocatorStrategy();
