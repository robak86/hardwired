import { ServiceLocator } from '../container/ServiceLocator';
import { ContainerContext } from '../container/ContainerContext';
import { Instance } from './abstract/Instance';

export class ServiceLocatorResolver extends Instance<ServiceLocator> {
  constructor() {
    super();
  }

  build(id: string, cache: ContainerContext): ServiceLocator {
    if (cache.hasInGlobalScope(id)) {
      return cache.getFromGlobalScope(id);
    } else {
      const instance = new ServiceLocator(cache);
      cache.setForGlobalScope(id, instance);
      return instance;
    }
  }
}

export const serviceLocator = (): Instance<ServiceLocator> => new ServiceLocatorResolver();
