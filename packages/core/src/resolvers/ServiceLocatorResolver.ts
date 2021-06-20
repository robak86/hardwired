import { ServiceLocator } from '../container/ServiceLocator';
import { BuildStrategy } from './abstract/BuildStrategy';
import { ContainerContext } from '../context/ContainerContext';
import { ContextLookup } from '../context/ContextLookup';
import { ContextMutations } from '../context/ContextMutations';

export class ServiceLocatorResolver extends BuildStrategy<ServiceLocator> {
  readonly strategyTag = strategyLocatorTag;

  constructor() {
    super();
  }

  build(id: string, context: ContainerContext): ServiceLocator {
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

export const serviceLocator = (): BuildStrategy<ServiceLocator> => new ServiceLocatorResolver();
