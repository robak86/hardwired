import { ServiceLocator } from '../container/ServiceLocator';
import { ContainerContext } from '../container/ContainerContext';
import { Instance } from './abstract/Instance';
import { ContextRecord } from '../container/ContainerContextStorage';
import { ContextLookup } from '../container/ContextLookup';
import { ContextMutations } from '../container/ContextMutations';

export class ServiceLocatorResolver extends Instance<ServiceLocator> {
  readonly strategyTag = strategyLocatorTag;

  constructor() {
    super();
  }

  build(id: string, context: ContextRecord): ServiceLocator {
    if (ContextLookup.hasInGlobalScope(id, context)) {
      return ContextLookup.getFromGlobalScope(id, context);
    } else {
      const instance = new ServiceLocator(context);
      ContextMutations.setForGlobalScope(id, instance, context);
      return instance;
    }
  }
}

export const strategyLocatorTag = Symbol();

export const serviceLocator = (): Instance<ServiceLocator> => new ServiceLocatorResolver();
