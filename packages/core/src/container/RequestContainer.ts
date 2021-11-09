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

  getAll<TLazyModule extends Array<InstanceDefinition<any, any, []>>>(
    ...definitions: TLazyModule
  ): {
    [K in keyof TLazyModule]: TLazyModule[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown;
  } {
    return definitions.map(def => this.containerContext.get(def)) as any;
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
}
