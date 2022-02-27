import { InstanceDefinition } from '../definitions/abstract/base/InstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/base/AsyncInstanceDefinition';
import { ContainerContext } from '../context/ContainerContext';
import { IContainer } from './IContainer';
import { v4 } from 'uuid';
import { ContainerScopeOptions } from './Container';

export class RequestContainer implements IContainer {
  constructor(protected readonly containerContext: ContainerContext, public id: string = v4()) {}

  get<TValue>(instanceDefinition: InstanceDefinition<TValue, any, []>): TValue {
    return this.containerContext.get(instanceDefinition);
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
    [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance, any, any>
      ? TInstance
      : unknown;
  } {
    return definitions.map(def => this.containerContext.get(def.bind(...externalParams))) as any;
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

  checkoutScope(options: ContainerScopeOptions = {}): IContainer {
    return new RequestContainer(this.containerContext.checkoutScope(options));
  }
}
