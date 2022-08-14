import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerContext } from '../context/ContainerContext.js';
import { v4 } from 'uuid';
import { IContainer } from './IContainer.js';
import { Container, ContainerScopeOptions } from './Container.js';

export class RequestContainer implements IContainer {
  constructor(protected readonly containerContext: ContainerContext, public id: string = v4()) {}

  get<TValue>(instanceDefinition: InstanceDefinition<TValue, any>): TValue {
    return this.containerContext.get(instanceDefinition);
  }

  getAsync<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any>): Promise<TValue> {
    return this.containerContext.getAsync(instanceDefinition);
  }

  getAll<TDefinitions extends InstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.containerContext.get(def) as any) as any;
  }

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
  ): Promise<AsyncInstancesArray<TDefinitions>> {
    return Promise.all(definitions.map(def => this.containerContext.getAsync(def))) as any;
  }

  checkoutRequestScope<TExternals = never>(externals?: TExternals): IContainer {
    return new RequestContainer(this.containerContext.checkoutRequestScope());
  }

  checkoutScope(options?: ContainerScopeOptions): IContainer {
    return new RequestContainer(this.containerContext.checkoutScope(options));
  }
}
