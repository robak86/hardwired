import { ServiceLocator } from "../container/ServiceLocator";
import { ContainerContext } from "../container/ContainerContext";
import { AbstractInstanceResolver } from "./abstract/AbstractResolvers";

export class ServiceLocatorResolver extends AbstractInstanceResolver<ServiceLocator, []> {
  constructor() {
    super();
  }

  build(cache: ContainerContext): ServiceLocator {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const instance = new ServiceLocator(cache);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export const serviceLocator = () => new ServiceLocatorResolver();
