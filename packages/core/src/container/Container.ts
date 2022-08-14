import { ContainerContext } from '../context/ContainerContext.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { IContainer } from './IContainer.js';
import { RequestContainer } from './RequestContainer.js';
import { v4 } from 'uuid';

export class Container implements IContainer {
  constructor(protected readonly containerContext: ContainerContext, public id: string = v4()) {}

  get<TValue, TExternals>(instanceDefinition: InstanceDefinition<TValue, any>): TValue {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.get(instanceDefinition);
  }

  withImplicits(...implicits: AnyInstanceDefinition<any, any>[]): Container {
    return new Container(this.containerContext.checkoutScope({ scopeOverrides: implicits }));
  }

  getAsync<TValue, TExternals>(instanceDefinition: AsyncInstanceDefinition<TValue, any>): Promise<TValue> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.getAsync(instanceDefinition);
  }

  getAll<TDefinitions extends InstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return definitions.map(def => requestContext.get(def)) as any;
  }

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
  ): Promise<AsyncInstancesArray<TDefinitions>> {
    const requestContext = this.containerContext.checkoutRequestScope();

    return Promise.all(definitions.map(def => requestContext.getAsync(def))) as any;
  }

  checkoutRequestScope<TExternals = never>(): RequestContainer<TExternals> {
    return new RequestContainer<TExternals>(this.containerContext.checkoutRequestScope());
  }

  /***
   * New container inherits current's container scopeOverrides, e.g. if current container has overrides for some singleton
   * then new scope will inherit this singleton unless one provides new overrides in options for this singleton.
   * Current containers instances built by "scoped" strategy are not inherited
   * @param options
   */
  checkoutScope(options: ContainerScopeOptions = {}): Container {
    return new Container(this.containerContext.checkoutScope(options));
  }
}

export type ContainerOptions = ContainerScopeOptions;

export type ContainerScopeOptions = {
  scopeOverrides?: AnyInstanceDefinition<any, any>[];
  globalOverrides?: AnyInstanceDefinition<any, any>[]; // propagated to descendant containers
};

export function container(globalOverrides?: AnyInstanceDefinition<any, any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(overridesOrOptions?: ContainerOptions | Array<AnyInstanceDefinition<any, any>>): Container {
  if (Array.isArray(overridesOrOptions)) {
    return new Container(ContainerContext.create([], overridesOrOptions, defaultStrategiesRegistry));
  } else {
    return new Container(
      ContainerContext.create(
        overridesOrOptions?.scopeOverrides ?? [],
        overridesOrOptions?.globalOverrides ?? [],
        defaultStrategiesRegistry,
      ),
    );
  }
}
