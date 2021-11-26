import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/AsyncInstanceDefinition';

export interface IContainer {
  get<TValue, TExternalParams extends any[]>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternalParams>,
    ...externals: TExternalParams
  ): TValue;

  getAsync<TValue, TExternalParams extends any[]>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, TExternalParams>,
    ...externalParams: TExternalParams
  ): Promise<TValue>;

  getAll<
      TDefinition extends InstanceDefinition<any, any, TExternalParams>,
      TDefinitions extends [] | [TDefinition] | [TDefinition, ...TDefinition[]],
      TExternalParams extends any[],
      >(
      definitions: TDefinitions,
      ...externalParams: TExternalParams
  ): {
    [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance, any, any> ? TInstance : unknown;
  };

  getAllAsync<TLazyModule extends Array<AsyncInstanceDefinition<any, any, []>>>(
    ...definitions: TLazyModule
  ): Promise<
    {
      [K in keyof TLazyModule]: TLazyModule[K] extends AsyncInstanceDefinition<infer TInstance, any, []>
        ? TInstance
        : unknown;
    }
  >;

  checkoutRequestScope(): IContainer
}
