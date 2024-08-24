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
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';

export interface Container {
  <TValue>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  <TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  <TValue>(instanceDefinition: BaseDefinition<TValue, any, any>): TValue;
  <TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue;
}

export class Container extends ExtensibleFunction implements IContainer {
  constructor(protected readonly containerContext: ContainerContext) {
    super((definition: AnyInstanceDefinition<any, any, any>) => {
      return this.use(definition as any);
    });
  }

  get parentId() {
    return this.containerContext.parentId;
  }

  get id() {
    return this.containerContext.id;
  }

  get events(): ContextEvents {
    return this.containerContext.events;
  }

  use<TValue>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  use<TValue>(instanceDefinition: BaseDefinition<TValue, any, any>): TValue;
  use<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue {
    return this.containerContext.request(instanceDefinition as any);
  }

  all<TDefinitions extends Array<InstanceDefinition<any, any, any> | BaseDefinition<any, any, any>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.containerContext.use(def)) as any;
  }

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
  globalOverrides?: Array<AnyInstanceDefinition<any, any, any> | BaseDefinition<any, any, any>>; // propagated to descendant containers
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  overrides?: Array<AnyInstanceDefinition<any, any, any> | BaseDefinition<any, any, any>>;
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
