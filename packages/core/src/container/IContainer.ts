import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition';
import { ContainerScopeOptions } from './Container';
import { ExternalsValues, PickExternals } from '../utils/PickExternals';
import { RequestContainer } from './RequestContainer';

export interface IContainer {
  readonly id: string;

  get<TValue, TExternals>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternals>,
    ...externals: ExternalsValues<TExternals>
  ): TValue;

  getAsync<TValue, TExternals>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, TExternals>,
    ...externals: ExternalsValues<TExternals>
  ): Promise<TValue>;

  getAll<TDefinitions extends InstanceDefinition<any, any, any>[]>(
    definitions: [...TDefinitions],
    ...[externals]: ExternalsValues<PickExternals<TDefinitions>>
  ): InstancesArray<TDefinitions>;

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, any, any>[]>(
    definitions: [...TDefinitions],
    ...[externals]: ExternalsValues<PickExternals<TDefinitions>>
  ): Promise<AsyncInstancesArray<TDefinitions>>;

  checkoutRequestScope<TExternals = never>(externals?: TExternals): RequestContainer<TExternals>;
  checkoutScope(options?: ContainerScopeOptions): IContainer;
}
