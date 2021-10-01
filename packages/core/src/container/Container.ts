import { Module } from '../module/Module';
import { ModulePatch } from '../module/ModulePatch';
import { ContainerContext } from '../context/ContainerContext';
import { IServiceLocator } from './IServiceLocator';
import { InstanceEntry } from '../new/InstanceEntry';
import { StrategiesRegistry } from '../strategies/abstract/_BuildStrategy';
import { SingletonStrategy } from '../strategies/SingletonStrategy';
import { ConstStrategy } from '../strategies/ConstStrategy';
import { FactoryFunctionSingletonStrategy } from '../strategies/FactoryFunctionSingletonStrategy';
import { TransientStrategy } from '../strategies/TransientStrategy';
import { DecoratorStrategy } from '../strategies/DecoratorStrategy';
import { RequestStrategy } from "../strategies/RequestStrategy";

export type ChildScopeOptions = {
  scopeOverrides?: ModulePatch<any>[];
  scopeOverridesNew?: InstanceEntry<any>[];
};

export const defaultStrategiesRegistry = new StrategiesRegistry({
  [SingletonStrategy.type]: new SingletonStrategy(),
  [TransientStrategy.type]: new TransientStrategy(),
  [ConstStrategy.type]: new ConstStrategy(),
  [FactoryFunctionSingletonStrategy.type]: new FactoryFunctionSingletonStrategy(),
  [DecoratorStrategy.type]: new DecoratorStrategy(),
  [RequestStrategy.type]: new RequestStrategy(),
});

export class Container implements IServiceLocator {
  constructor(protected readonly containerContext: ContainerContext) {}

  get id(): string {
    return this.containerContext.id;
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.get(moduleInstance, name);
  }

  __get<TValue>(instanceDefinition: InstanceEntry<TValue>): TValue {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.__get(instanceDefinition);
  }

  __getAll<TLazyModule extends Record<string, InstanceEntry<any>> | Array<InstanceEntry<any>>>(
    moduleInstance: TLazyModule,
  ): { [K in keyof TLazyModule]: TLazyModule[K] extends InstanceEntry<infer TInstance> ? TInstance : unknown } {
    const requestContext = this.containerContext.checkoutRequestScope();
    // return requestContext.get(moduleInstance, name);
    throw new Error('Implement me!');
  }

  select<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn {
    return inject(this.containerContext.checkoutRequestScope());
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.materialize(module);
  }

  __asObject<TModule extends Record<string, InstanceEntry<any>>>(
    module: TModule,
  ): { [K in keyof TModule]: TModule[K] extends InstanceEntry<infer TValue> ? TValue : unknown } {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.__materialize(module);
  }

  asObjectMany<TModule extends Module<any>, TModules extends [TModule, ...TModule[]]>(
    ...modules: TModules
  ): Module.MaterializedArray<TModules> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return modules.map(module => {
      return requestContext.materialize(module);
    }) as any;
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
  scopeOverrides?: ModulePatch<any>[]; // used only in descendent scopes (can be overridden)
  scopeOverridesNew?: InstanceEntry<any>[];
  globalOverrides?: ModulePatch<any>[]; // propagated to whole dependencies graph
  globalOverridesNew?: InstanceEntry<any>[]; // propagated to whole dependencies graph
};

export function container(globalOverrides?: ModulePatch<any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(overridesOrOptions?: ContainerOptions | Array<ModulePatch<any>>): Container {
  if (Array.isArray(overridesOrOptions)) {
    throw new Error('Implement me!');
    // return new Container(ContainerContext.create([], overridesOrOptions, defaultStrategiesRegistry));
  } else {
    return new Container(
      ContainerContext.create(
        overridesOrOptions?.scopeOverrides ?? [],
        overridesOrOptions?.globalOverrides ?? [],
        overridesOrOptions?.scopeOverridesNew ?? [],
        overridesOrOptions?.globalOverridesNew ?? [],
        defaultStrategiesRegistry,
      ),
    );
  }
}
