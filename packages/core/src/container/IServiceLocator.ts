import { Module } from '../module/Module';
import { ContainerContext } from '../context/ContainerContext';
import { InstanceEntry } from '../new/InstanceEntry';

export interface IServiceLocator {
  get<TValue>(instanceDefinition: InstanceEntry<TValue>): TValue;

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule>;

  select<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn;
}
