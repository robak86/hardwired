import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition';
import { ContainerScopeOptions } from './Container';
import { ExternalsValues, PickExternals } from '../utils/PickExternals';

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

  getAll<
    TDefinition extends InstanceDefinition<any, any, any>,
    TDefinitions extends [TDefinition] | [TDefinition, ...TDefinition[]],
  >(
    definitions: TDefinitions,
    ...externals: ExternalsValues<PickExternals<TDefinitions>>
  ): {
    [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance, any, any>
      ? TInstance
      : unknown;
  };

  getAllAsync<
    TDefinition extends AsyncInstanceDefinition<any, any, any>,
    TDefinitions extends [TDefinition] | [TDefinition, ...TDefinition[]],
  >(
    definitions: TDefinitions,
    ...externals: ExternalsValues<PickExternals<TDefinitions>>
  ): Promise<
    {
      [K in keyof TDefinitions]: TDefinitions[K] extends AsyncInstanceDefinition<infer TInstance, any, []>
        ? TInstance
        : unknown;
    }
  >;

  checkoutRequestScope(): IContainer;
  checkoutScope(options?: ContainerScopeOptions): IContainer;
}
