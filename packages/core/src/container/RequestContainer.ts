import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/AsyncInstanceDefinition';
import { ContainerContext } from '../context/ContainerContext';
import { IContainer } from './IContainer';
import { v4 } from 'uuid';

export class RequestContainer implements IContainer {
  constructor(protected readonly containerContext: ContainerContext, public id: string = v4()) {}

  get<TValue, TExternalParams extends any[]>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternalParams>,
    ...externals: TExternalParams
  ): TValue {
    return this.containerContext.get(instanceDefinition, ...externals);
  }

  getAsync<TValue, TExternalParams extends any[]>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, TExternalParams>,
    ...externalParams: TExternalParams
  ): Promise<TValue> {
    return this.containerContext.getAsync(instanceDefinition, ...externalParams);
  }

  getAll<
    TDefinition extends InstanceDefinition<any, any, TExternalParams>,
    TDefinitions extends [] | [TDefinition] | [TDefinition, ...TDefinition[]],
    TExternalParams extends any[],
  >(
    definitions: TDefinitions,
    ...externalParams: TExternalParams
  ): {
    [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance, any, any> ? TInstance : unknown;
  } {
    return definitions.map(def => this.containerContext.get(def, ...externalParams)) as any;
  }

  getAllAsync<TLazyModule extends Array<AsyncInstanceDefinition<any, any, []>>>(
    ...definitions: TLazyModule
  ): Promise<
    {
      [K in keyof TLazyModule]: TLazyModule[K] extends AsyncInstanceDefinition<infer TInstance, any, []>
        ? TInstance
        : unknown;
    }
  > {
    return Promise.all(definitions.map(def => this.containerContext.getAsync(def))) as any;
  }

  checkoutRequestScope(): IContainer {
    return new RequestContainer(this.containerContext.checkoutRequestScope());
  }
}
