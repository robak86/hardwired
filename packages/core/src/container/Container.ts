import { ContainerContext } from '../context/ContainerContext';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry';
import { IContainer } from './IContainer';
import { RequestContainer } from './RequestContainer';
import { v4 } from 'uuid';

// TODO: instead of using separate implementation for RequestContainer parametrize Container with reuseRequestContext = boolean
export class Container implements IContainer {
  constructor(protected readonly containerContext: ContainerContext, public id: string = v4()) {}

  get<TValue>(instanceDefinition: InstanceDefinition<TValue, any, []>): TValue {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.get(instanceDefinition);
  }

  getAsync<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, []>): Promise<TValue> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.getAsync(instanceDefinition);
  }

  getAll<
    TDefinition extends InstanceDefinition<any, any, []>,
    TDefinitions extends [] | [TDefinition] | [TDefinition, ...TDefinition[]],
  >(
    ...definitions: TDefinitions
  ): {
    [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance, any, any>
      ? TInstance
      : unknown;
  } {
    const requestContext = this.containerContext.checkoutRequestScope();
    return definitions.map(def => requestContext.get(def)) as any;
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
    const requestContext = this.containerContext.checkoutRequestScope();

    return Promise.all(definitions.map(def => requestContext.getAsync(def))) as any;
  }

  checkoutRequestScope(): IContainer {
    return new RequestContainer(this.containerContext.checkoutRequestScope());
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
  scopeOverrides?: AnyInstanceDefinition<any, any, any>[];
  globalOverrides?: AnyInstanceDefinition<any, any, any>[]; // propagated to descendant containers
};

export function container(globalOverrides?: AnyInstanceDefinition<any, any, any>[]): Container;
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
