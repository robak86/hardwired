import { ContainerContext } from '../context/ContainerContext';
import { IServiceLocator } from './IServiceLocator';
import { InstanceEntry } from '../new/InstanceEntry';
import { StrategiesRegistry } from '../strategies/abstract/_BuildStrategy';
import { SingletonStrategy } from '../strategies/SingletonStrategy';
import { ConstStrategy } from '../strategies/ConstStrategy';
import { FactoryFunctionSingletonStrategy } from '../strategies/FactoryFunctionSingletonStrategy';
import { TransientStrategy } from '../strategies/TransientStrategy';
import { DecoratorStrategy } from '../strategies/DecoratorStrategy';
import { RequestStrategy } from '../strategies/RequestStrategy';
import { ScopeStrategy } from '../strategies/ScopeStrategy';
import { ServiceLocatorStrategy } from '../strategies/ServiceLocatorStrategy';

export type ChildScopeOptions = {
  scopeOverridesNew?: InstanceEntry<any>[];
};

export const defaultStrategiesRegistry = new StrategiesRegistry({
  [SingletonStrategy.type]: new SingletonStrategy(),
  [TransientStrategy.type]: new TransientStrategy(),
  [ConstStrategy.type]: new ConstStrategy(),
  [FactoryFunctionSingletonStrategy.type]: new FactoryFunctionSingletonStrategy(),
  [DecoratorStrategy.type]: new DecoratorStrategy(),
  [RequestStrategy.type]: new RequestStrategy(),
  [ScopeStrategy.type]: new ScopeStrategy(),
  [ServiceLocatorStrategy.type]: new ServiceLocatorStrategy(),
});

export class Container implements IServiceLocator {
  constructor(protected readonly containerContext: ContainerContext) {}

  get id(): string {
    return this.containerContext.id;
  }

  __get<TValue>(instanceDefinition: InstanceEntry<TValue>): TValue {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.__get(instanceDefinition);
  }

  __getAll<TLazyModule extends Array<InstanceEntry<any>>>(
    ...definitions: TLazyModule
  ): { [K in keyof TLazyModule]: TLazyModule[K] extends InstanceEntry<infer TInstance> ? TInstance : unknown } {
    const requestContext = this.containerContext.checkoutRequestScope();

    return definitions.map(def => requestContext.__get(def)) as any;
  }

  select<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn {
    return inject(this.containerContext.checkoutRequestScope());
  }

  // TODO: we still should create object with lazy properties
  __asObject<TModule extends Record<string, InstanceEntry<any>>>(
    module: TModule,
  ): { [K in keyof TModule]: TModule[K] extends InstanceEntry<infer TValue> ? TValue : unknown } {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.__materialize(module);
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
  scopeOverridesNew?: InstanceEntry<any>[];
  globalOverridesNew?: InstanceEntry<any>[]; // propagated to whole dependencies graph
};

export function container(globalOverrides?: InstanceEntry<any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(overridesOrOptions?: ContainerOptions | Array<InstanceEntry<any>>): Container {
  if (Array.isArray(overridesOrOptions)) {
    return new Container(ContainerContext.create([], overridesOrOptions, defaultStrategiesRegistry));
  } else {
    return new Container(
      ContainerContext.create(
        overridesOrOptions?.scopeOverridesNew ?? [],
        overridesOrOptions?.globalOverridesNew ?? [],
        defaultStrategiesRegistry,
      ),
    );
  }
}
