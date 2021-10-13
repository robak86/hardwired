import { ContainerContext } from '../context/ContainerContext';
import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { SingletonStrategy } from '../strategies/sync/SingletonStrategy';
import { TransientStrategy } from '../strategies/sync/TransientStrategy';
import { RequestStrategy } from '../strategies/sync/RequestStrategy';
import { ScopeStrategy } from '../strategies/sync/ScopeStrategy';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry';
import { AsyncSingletonStrategy } from '../strategies/async/AsyncSingletonStrategy';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';
import { AsyncTransientStrategy } from '../strategies/async/AsyncTransientStrategy';
import { AsyncRequestStrategy } from '../strategies/async/AsyncRequestStrategy';
import { AsyncScopedStrategy } from '../strategies/async/AsyncScopedStrategy';
import { AsyncInstanceDefinition } from '../definitions/abstract/AsyncInstanceDefinition';

export type ChildScopeOptions = {
  scopeOverrides?: AnyInstanceDefinition<any>[];
};

export const defaultStrategiesRegistry = new StrategiesRegistry({
  [SingletonStrategy.type]: new SingletonStrategy(),
  [TransientStrategy.type]: new TransientStrategy(),
  [RequestStrategy.type]: new RequestStrategy(),
  [ScopeStrategy.type]: new ScopeStrategy(),

  [AsyncSingletonStrategy.type]: new AsyncSingletonStrategy(),
  [AsyncTransientStrategy.type]: new AsyncTransientStrategy(),
  [AsyncRequestStrategy.type]: new AsyncRequestStrategy(),
  [AsyncScopedStrategy.type]: new AsyncScopedStrategy(),
});

export class Container {
  constructor(protected readonly containerContext: ContainerContext) {}

  get<TValue>(instanceDefinition: InstanceDefinition<TValue, void>): TValue;
  get<TValue, TExternalParams>(
    instanceDefinition: InstanceDefinition<TValue, TExternalParams>,
    externals: TExternalParams,
  ): TValue;
  get<TValue>(instanceDefinition: InstanceDefinition<TValue, any>, externals?: any): TValue {
    return this.containerContext.get(instanceDefinition, externals);
  }

  getAsync<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any>): Promise<TValue> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.getAsync(instanceDefinition);
  }

  getAll<TLazyModule extends Array<InstanceDefinition<any>>>(
    ...definitions: TLazyModule
  ): { [K in keyof TLazyModule]: TLazyModule[K] extends InstanceDefinition<infer TInstance> ? TInstance : unknown } {
    const requestContext = this.containerContext.checkoutRequestScope();

    return definitions.map(def => requestContext.get(def)) as any;
  }

  /***
   * New container inherits current's container scopeOverrides, e.g. if current container has overrides for some singleton
   * then new scope will inherit this singleton unless one provides new overrides in options for this singleton.
   * Current containers' instances build by "scoped" strategy are not inherited
   * @param options
   */
  checkoutScope(options: ChildScopeOptions = {}): Container {
    return new Container(this.containerContext.childScope(options));
  }
}

export type ContainerOptions = ContainerScopeOptions;

export type ContainerScopeOptions = {
  scopeOverrides?: AnyInstanceDefinition<any, any>[];
  globalOverrides?: AnyInstanceDefinition<any, any>[]; // propagated to whole dependencies graph
};

export function container(globalOverrides?: AnyInstanceDefinition<any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(overridesOrOptions?: ContainerOptions | Array<AnyInstanceDefinition<any>>): Container {
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
