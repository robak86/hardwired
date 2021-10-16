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
import { LifeTime } from '../definitions/abstract/LifeTime';

export type ChildScopeOptions = {
  scopeOverrides?: AnyInstanceDefinition<any, any, any>[];
};

export const defaultStrategiesRegistry = new StrategiesRegistry(
  {
    [LifeTime.singleton]: new SingletonStrategy(),
    [LifeTime.transient]: new TransientStrategy(),
    [LifeTime.request]: new RequestStrategy(),
    [LifeTime.scoped]: new ScopeStrategy(),
  },
  {
    [LifeTime.singleton]: new AsyncSingletonStrategy(),
    [LifeTime.transient]: new AsyncTransientStrategy(),
    [LifeTime.request]: new AsyncRequestStrategy(),
    [LifeTime.scoped]: new AsyncScopedStrategy(),
  },
);

export class Container {
  constructor(protected readonly containerContext: ContainerContext) {}

  // get<TValue>(instanceDefinition: InstanceDefinition<TValue, []>): TValue;
  get<TValue, TExternalParams extends any[]>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternalParams>,
    ...externals: TExternalParams
  ): TValue {
    return this.containerContext.get(instanceDefinition, ...externals);
  }

  getAsync<TValue, TExternalParams extends any[]>(
    instanceDefinition: AnyInstanceDefinition<TValue, any, TExternalParams>,
    ...externalParams: TExternalParams
  ): Promise<TValue> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.getAsync(instanceDefinition, ...externalParams);
  }

  getAll<TLazyModule extends Array<InstanceDefinition<any, any>>>(
    ...definitions: TLazyModule
  ): {
    [K in keyof TLazyModule]: TLazyModule[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown;
  } {
    const requestContext = this.containerContext.checkoutRequestScope();

    return definitions.map(def => requestContext.get(def)) as any;
  }
}

export type ContainerOptions = ContainerScopeOptions;

export type ContainerScopeOptions = {
  scopeOverrides?: AnyInstanceDefinition<any, any, any>[];
  globalOverrides?: AnyInstanceDefinition<any, any, any>[]; // propagated to whole dependencies graph
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
