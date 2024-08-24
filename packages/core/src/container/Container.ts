import { ContainerContext } from '../context/ContainerContext.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { IContainer } from './IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { set } from '../patching/set.js';
import { ContextEvents } from '../events/ContextEvents.js';
import { ContainerInterceptor } from '../context/ContainerInterceptor.js';
import { BaseFnDefinition, FnDefinition } from '../definitions/abstract/FnDefinition.js';

export class Container implements IContainer {
  constructor(protected readonly containerContext: ContainerContext) {}

  get parentId() {
    return this.containerContext.parentId;
  }

  get id() {
    return this.containerContext.id;
  }

  get events(): ContextEvents {
    return this.containerContext.events;
  }

  call = <TValue>(instanceDefinition: BaseFnDefinition<TValue, any, any>): TValue =>
    this.containerContext.requestCall(instanceDefinition);

  use<TValue>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  use<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue {
    return this.containerContext.request(instanceDefinition as any);
  }

  useAll<TDefinitions extends InstanceDefinition<any, any, any>[]>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.containerContext.use(def)) as any;
  }

  // callAsyncAll<TDefinitions extends FnDefinition<any, any, any>[]>(
  //   ...definitions: [...TDefinitions]
  // ): Promise<AsyncInstancesArray<TDefinitions>> {
  //   return Promise.all(definitions.map(def => this.containerContext.requestCall(def))) as any;
  // }

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, any, any>[]>(
    ...definitions: [...TDefinitions]
  ): Promise<AsyncInstancesArray<TDefinitions>> {
    return Promise.all(definitions.map(def => this.containerContext.use(def))) as any;
  }

  checkoutScope(options: ContainerScopeOptions = {}): IContainer {
    return new Container(this.containerContext.checkoutScope(options));
  }

  withScope<TValue>(fn: (locator: IContainer) => TValue): TValue {
    return fn(this.checkoutScope());
  }

  override(definition: AnyInstanceDefinition<any, any, any>): void {
    this.containerContext.override(definition);
  }

  provide<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: T): void {
    const override = set(def, instance);
    return this.override(override);
  }
}

export type ContainerOptions = {
  globalOverrides?: Array<AnyInstanceDefinition<any, any, any> | FnDefinition<any, any, any>>; // propagated to descendant containers
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  overrides?: Array<AnyInstanceDefinition<any, any, any> | FnDefinition<any, any, any>>;
  interceptor?: ContainerInterceptor;
};

export function container(globalOverrides?: AnyInstanceDefinition<any, any, any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(
  overridesOrOptions?: ContainerOptions | Array<AnyInstanceDefinition<any, any, any>>,
): Container {
  if (Array.isArray(overridesOrOptions)) {
    return new Container(ContainerContext.create([], overridesOrOptions, defaultStrategiesRegistry));
  } else {
    return new Container(
      ContainerContext.create(
        overridesOrOptions?.overrides ?? [],
        overridesOrOptions?.globalOverrides ?? [],
        defaultStrategiesRegistry,
        overridesOrOptions?.interceptor,
      ),
    );
  }
}
