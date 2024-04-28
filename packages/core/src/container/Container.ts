import { ContainerContext } from '../context/ContainerContext.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { IContainer } from './IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { set } from '../patching/set.js';

export class Container implements IContainer {
  constructor(protected readonly containerContext: ContainerContext) {}

  get parentId() {
    return this.containerContext.parentId;
  }

  get id() {
    return this.containerContext.id;
  }

  use<TValue, TExternals>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue, TExternals>(instanceDefinition: InstanceDefinition<Promise<TValue>, any, any>): Promise<TValue>;
  use<TValue, TExternals>(
    instanceDefinition: InstanceDefinition<Promise<TValue> | TValue, any, any>,
  ): Promise<TValue> | TValue {
    return this.containerContext.use(instanceDefinition as any);
  }

  useAll<TDefinitions extends InstanceDefinition<any, any, any>[]>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.containerContext.use(def)) as any;
  }

  useAllAsync<TDefinitions extends InstanceDefinition<any, any, any>[]>(
    definitions: [...TDefinitions],
  ): Promise<InstancesArray<TDefinitions>> {
    return Promise.all(definitions.map(async def => this.containerContext.use(def as any))) as any;
  }

  checkoutScope(options: ContainerScopeOptions = {}): IContainer {
    return new Container(this.containerContext.checkoutScope(options));
  }

  withScope<TValue>(fn: (locator: IContainer) => TValue): TValue {
    return fn(this.checkoutScope());
  }

  override(definition: InstanceDefinition<any, any, any>): void {
    this.containerContext.override(definition);
  }

  provide<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: T): void {
    const override = set(def, instance);
    return this.override(override);
  }

  dispose(): void {
    throw new Error('Implement me!');
  }
}

export type ContainerOptions = {
  globalOverrides?: InstanceDefinition<any, any, any>[]; // propagated to descendant containers
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  overrides?: InstanceDefinition<any, any, any>[];
};

export function container(globalOverrides?: InstanceDefinition<any, any, any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(overridesOrOptions?: ContainerOptions | Array<InstanceDefinition<any, any, any>>): Container {
  if (Array.isArray(overridesOrOptions)) {
    return new Container(ContainerContext.create([], overridesOrOptions, defaultStrategiesRegistry));
  } else {
    return new Container(
      ContainerContext.create(
        overridesOrOptions?.overrides ?? [],
        overridesOrOptions?.globalOverrides ?? [],
        defaultStrategiesRegistry,
      ),
    );
  }
}
