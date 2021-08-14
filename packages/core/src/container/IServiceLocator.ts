import { Module } from '../module/Module';
import { ContainerContext } from '../context/ContainerContext';

export interface IServiceLocator {
  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K];

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule>;
  asObjectMany<TModule extends Module<any>, TModules extends [TModule, ...TModule[]]>(
    ...modules: TModules
  ): Module.MaterializedArray<TModules>;

  getSlice<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn;
}
