import { Module } from '../resolvers/abstract/Module';

export interface IContainer {
  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K];

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule>;
}
