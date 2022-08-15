import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

export interface ISyncContainer<TAllowedLifeTime extends LifeTime = LifeTime> {
  get<TValue, TExternals>(
    instanceDefinition: InstanceDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
  ): TValue;

  getAll<TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions>;
}

export interface IAsyncContainer<TAllowedLifeTime extends LifeTime = LifeTime> {
  getAsync<TValue, TExternals>(
    instanceDefinition: AsyncInstanceDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
  ): Promise<TValue>;

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>>[]>(
    definitions: [...TDefinitions],
  ): Promise<AsyncInstancesArray<TDefinitions>>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  checkoutRequestScope<TExternals = never>(externals?: TExternals): IContainer<TAllowedLifeTime>;
  checkoutScope(options?: ContainerScopeOptions): IContainer<TAllowedLifeTime>;

  withNewRequestScope<TValue>(fn: (locator: IContainer<TAllowedLifeTime>) => TValue): TValue;
}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends ISyncContainer<TAllowedLifeTime>,
    IAsyncContainer<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {
  readonly id: string;
}
