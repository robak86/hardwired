import { ContainerContext } from '../context/ContainerContext';
import { IServiceLocator } from './IServiceLocator';
import { InstanceDefinition } from '../definitions/InstanceDefinition';
import { SingletonStrategy } from '../strategies/sync/SingletonStrategy';
import { TransientStrategy } from '../strategies/sync/TransientStrategy';
import { RequestStrategy } from '../strategies/sync/RequestStrategy';
import { ScopeStrategy } from '../strategies/sync/ScopeStrategy';
import { ServiceLocatorStrategy } from '../strategies/ServiceLocatorStrategy';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry';
import { AsyncSingletonStrategy } from '../strategies/async/AsyncSingletonStrategy';
import { AnyInstanceDefinition } from '../definitions/AnyInstanceDefinition';

export type ChildScopeOptions = {
  scopeOverrides?: InstanceDefinition<any>[];
};

export const defaultStrategiesRegistry = new StrategiesRegistry({
  [SingletonStrategy.type]: new SingletonStrategy(),
  [TransientStrategy.type]: new TransientStrategy(),
  [RequestStrategy.type]: new RequestStrategy(),
  [ScopeStrategy.type]: new ScopeStrategy(),
  [ServiceLocatorStrategy.type]: new ServiceLocatorStrategy(),
  [AsyncSingletonStrategy.type]: new AsyncSingletonStrategy(),
});

export class Container {
  constructor(protected readonly containerContext: ContainerContext) {}

  get<TValue>(instanceDefinition: InstanceDefinition<TValue, any>): TValue {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.get(instanceDefinition);
  }

  getAsync<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any>): Promise<TValue> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.getAsync(instanceDefinition);
  }

  getAll<TLazyModule extends Array<InstanceDefinition<any>>>(
    ...definitions: TLazyModule
  ): { [K in keyof TLazyModule]: TLazyModule[K] extends InstanceDefinition<infer TInstance> ? TInstance : unknown } {
    const requestContext = this.containerContext.checkoutRequestScope();

    return definitions.map(def => requestContext.get(def)) as any;
  }

  select<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn {
    return inject(this.containerContext.checkoutRequestScope());
  }

  // TODO: we still should create object with lazy properties
  asObject<TModule extends Record<string, InstanceDefinition<any>>>(
    module: TModule,
  ): { [K in keyof TModule]: TModule[K] extends InstanceDefinition<infer TValue> ? TValue : unknown } {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.materialize(module);
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

export function container(globalOverrides?: InstanceDefinition<any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(overridesOrOptions?: ContainerOptions | Array<InstanceDefinition<any>>): Container {
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
