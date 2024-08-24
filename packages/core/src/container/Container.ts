import { ContainerContext } from '../context/ContainerContext.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { IContainer, IContainerScopes, UseFn } from './IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { set } from '../patching/set.js';
import { ContextEvents } from '../events/ContextEvents.js';
import { ContainerInterceptor } from '../context/ContainerInterceptor.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { isPatchSet, Overrides, PatchSet } from './Patch.js';

export interface Container extends UseFn {}

export class Container extends ExtensibleFunction implements IContainer {
  readonly use: UseFn;

  constructor(protected readonly containerContext: ContainerContext) {
    const create: UseFn = definition => {
      return this.containerContext.request(definition as any);
    };

    super(create);
    this.use = create;
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

  all<TDefinitions extends Array<InstanceDefinition<any, any, any> | BaseDefinition<any, any, any>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.containerContext.use(def)) as any;
  }

  allAsync = <TDefinitions extends AsyncInstanceDefinition<any, any, any>[]>(
    ...definitions: [...TDefinitions]
  ): Promise<AsyncInstancesArray<TDefinitions>> =>
    Promise.all(definitions.map(def => this.containerContext.use(def))) as any;

  checkoutScope = (options: ContainerScopeOptions = {}): IContainer =>
    new Container(this.containerContext.checkoutScope(options));

  withScope: IContainerScopes['withScope'] = (fnOrOverrides, fn?: any) => {
    if (typeof fnOrOverrides === 'function') {
      return fnOrOverrides(this.checkoutScope());
    } else {
      return fn!(this.checkoutScope({ overrides: fnOrOverrides }));
    }
  };

  override = (definition: AnyInstanceDefinition<any, any, any>): void => {
    this.containerContext.override(definition);
  };

  provide = <T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: T): void => {
    const override = set(def, instance);
    return this.override(override);
  };
}

export type ContainerOptions = {
  globalOverrides?: Overrides; // propagated to descendant containers
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  overrides?: Overrides;
  interceptor?: ContainerInterceptor;
};

export function container(globalOverrides?: AnyInstanceDefinition<any, any, any>[] | PatchSet): Container;
export function container(options?: ContainerOptions): Container;
export function container(
  overridesOrOptions?: ContainerOptions | Array<AnyInstanceDefinition<any, any, any>> | PatchSet,
): Container {
  if (Array.isArray(overridesOrOptions)) {
    return new Container(ContainerContext.create([], overridesOrOptions, defaultStrategiesRegistry));
  } else if (isPatchSet(overridesOrOptions)) {
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
