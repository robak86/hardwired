import { Module } from '../module/Module';
import { InstancesCache } from '../context/InstancesCache';
import { ContainerContext } from '../context/ContainerContext';
import { createContainerId } from '../utils/fastId';
import { ModuleMaterialization } from '../context/ModuleMaterialization';
import { IServiceLocator } from './IServiceLocator';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry';
import { InstanceEntry } from "../new/InstanceEntry";

export class ServiceLocator implements IServiceLocator {
  private containerContext: ContainerContext;

  constructor(
    private instancesCache: InstancesCache,
    private definitionsRegistry: InstancesDefinitionsRegistry,
  ) {
    this.containerContext = new ContainerContext(
      createContainerId(),
      this.definitionsRegistry,
      instancesCache,
      new ModuleMaterialization(this.definitionsRegistry),
    );
  }

  withRequestScope<T>(factory: (obj: IServiceLocator) => T): T {
    const serviceLocator = new ServiceLocator(
      this.instancesCache.checkoutForRequestScope(),
      this.definitionsRegistry.checkoutForRequestScope(),
    );

    return factory(serviceLocator);
  }

  get = <TValue>(instanceDefinition: InstanceEntry<TValue>): TValue  => {
    return this.containerContext.__get(instanceDefinition);
  };

  select = <TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn =>
    inject(this.containerContext.checkoutRequestScope());

  asObject = <TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> => {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.materialize(module);
  };
}
