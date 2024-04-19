import { ContainerContext, ContainerInterceptor } from '../context/ContainerContext.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { IContainer } from './IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { set } from '../patching/set.js';
import { replace } from '../patching/replace.js';
import { asyncFn } from '../definitions/async/asyncFn.js';
import { ContextEvents } from '../events/ContextEvents.js';
import { getEagerDefinitions } from '../context/eagerDefinitions.js';

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

  get<TValue, TExternals>(instanceDefinition: InstanceDefinition<TValue, any>): TValue;
  get<TValue, TExternals>(instanceDefinition: AsyncInstanceDefinition<TValue, any>): Promise<TValue>;
  get<TValue, TExternals>(instanceDefinition: AnyInstanceDefinition<TValue, any>): Promise<TValue> | TValue {
    return this.containerContext.get(instanceDefinition as any);
  }

  getAll<TDefinitions extends InstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.containerContext.get(def)) as any;
  }

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
  ): Promise<AsyncInstancesArray<TDefinitions>> {
    return Promise.all(definitions.map(def => this.containerContext.get(def))) as any;
  }

  checkoutScope(options: ContainerScopeOptions = {}): IContainer {
    return new Container(this.containerContext.checkoutScope(options));
  }

  withScope<TValue>(fn: (locator: IContainer) => TValue): TValue {
    return fn(this.checkoutScope());
  }

  override(definition: AnyInstanceDefinition<any, any>): void {
    this.containerContext.addScopeOverride(definition);
  }

  provide<T>(def: InstanceDefinition<T, LifeTime.scoped>, instance: T): void {
    const override = set(def, instance);
    return this.override(override);
  }

  provideAsync<T>(def: AnyInstanceDefinition<T, LifeTime.scoped>, instance: () => Promise<T>): void {
    const override = replace(def, asyncFn(LifeTime.scoped)(instance)); // do not import definitions => circular dependencies
    return this.override(override);
  }

  dispose(): void {
    throw new Error('Implement me!');
  }
}

export type ContainerOptions = {
  globalOverrides?: AnyInstanceDefinition<any, any>[]; // propagated to descendant containers
  eagerGroups?: string[];
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  overrides?: AnyInstanceDefinition<any, any>[];
  interceptor?: ContainerInterceptor;
  eagerGroups?: string[];
};

export function container(globalOverrides?: AnyInstanceDefinition<any, any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(overridesOrOptions?: ContainerOptions | Array<AnyInstanceDefinition<any, any>>): Container {
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
