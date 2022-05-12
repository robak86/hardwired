import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition';
import { ContainerContext } from '../context/ContainerContext';
import { IContainer } from './IContainer';
import { v4 } from 'uuid';
import { ContainerScopeOptions } from './Container';

export class RequestContainer  {
  constructor(protected readonly containerContext: ContainerContext, public id: string = v4()) {}

  get<TValue>(instanceDefinition: InstanceDefinition<TValue, any, never>): TValue {
    return this.containerContext.get(instanceDefinition);
  }

  getAsync<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, never>): Promise<TValue> {
    return this.containerContext.getAsync(instanceDefinition);
  }

  getAll<
    TDefinition extends InstanceDefinition<any, any, never>,
    TDefinitions extends  [TDefinition] | [TDefinition, ...TDefinition[]],
  >(
    ...definitions: TDefinitions
  ): {
    [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance, any, any>
      ? TInstance
      : unknown;
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

  checkoutRequestScope(): IContainer {
    return new RequestContainer(this.containerContext.checkoutRequestScope());
  }

  checkoutScope(options: ContainerScopeOptions = {}): IContainer {
    return new RequestContainer(this.containerContext.checkoutScope(options));
  }
}
