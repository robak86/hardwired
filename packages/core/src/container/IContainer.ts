import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerScopeOptions } from './Container.js';
import { RequestContainer } from './RequestContainer.js';

export interface IContainer {
  readonly id: string;

  get<TValue, TExternals>(
    instanceDefinition: InstanceDefinition<TValue, any>,
  ): TValue;

  getAsync<TValue, TExternals>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any>,
  ): Promise<TValue>;

  getAll<TDefinitions extends InstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions>;

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
  ): Promise<AsyncInstancesArray<TDefinitions>>;

  checkoutRequestScope<TExternals = never>(externals?: TExternals): RequestContainer<TExternals>;
  checkoutScope(options?: ContainerScopeOptions): IContainer;
}
