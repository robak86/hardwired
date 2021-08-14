import { ServiceLocator } from '../container/ServiceLocator';
import { BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class ServiceLocatorResolver extends BuildStrategy<ServiceLocator> {
  readonly strategyTag = strategyLocatorTag;

  constructor() {
    super();
  }

  build(id: string, context: InstancesCache): ServiceLocator {
    if (context.hasInGlobalScope(id)) {
      return context.getFromGlobalScope(id);
    } else {
      throw new Error("Service locator strategy not implemented!")
      // const instance = new ServiceLocator(context);
      // ContextMutations.setForGlobalScope(id, instance, context);
      // return instance;
    }
  }
}

export const strategyLocatorTag = Symbol();

export const serviceLocator = (): BuildStrategy<ServiceLocator> => new ServiceLocatorResolver();
