import { Module } from '../module/Module';
import { ContainerContext } from '../context/ContainerContext';

export interface IServiceLocator {


  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule>;

  select<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn;
}
