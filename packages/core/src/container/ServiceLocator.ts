import { Module, ModuleRecord } from '../module/Module';
import { InstancesCache } from '../context/InstancesCache';
import { ResolversRegistry } from '../context/ResolversRegistry';
import { ContainerContext } from '../context/ContainerContext';
import { createContainerId } from '../utils/fastId';
import { ModuleMaterialization } from '../context/ModuleMaterialization';
import { IServiceLocator } from './IServiceLocator';

export class ServiceLocator implements IServiceLocator {
  private containerContext: ContainerContext;

  constructor(private instancesCache: InstancesCache, private resolversRegistry: ResolversRegistry) {
    this.containerContext = new ContainerContext(
      createContainerId(),
      resolversRegistry,
      instancesCache,
      new ModuleMaterialization(resolversRegistry),
    );
  }

  withScope<T>(factory: (obj: IServiceLocator) => T): T {
    const serviceLocator = new ServiceLocator(
      this.instancesCache.checkoutForRequestScope(),
      this.resolversRegistry.checkoutForRequestScope(),
    );

    return factory(serviceLocator);
  }

  get = <TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] => this.containerContext.get(moduleInstance, name);

  select = <TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn =>
    inject(this.containerContext.checkoutRequestScope());

  asObject = <TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> => {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.materialize(module);
  };
}
