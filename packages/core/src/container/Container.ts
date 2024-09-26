import { ContainerContext } from '../context/ContainerContext.js';
import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { AsyncAllInstances, IContainer, IContainerScopes, UseFn } from './IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { ContextEvents } from '../events/ContextEvents.js';
import { ContainerInterceptor } from '../context/ContainerInterceptor.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { isPatchSet, Overrides, PatchSet } from './Patch.js';

export interface Container extends UseFn {}

export class Container extends ExtensibleFunction implements IContainer {
  readonly use: UseFn;

  constructor(protected readonly containerContext: ContainerContext) {
    const create: UseFn = (definition: any, ...args: any[]) => {
      return this.containerContext.request(definition, ...args) as any;
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

  all<TDefinitions extends Array<BaseDefinition<any, any, any, any>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.containerContext.use(def)) as any;
  }

  allAsync = <TDefinitions extends Array<BaseDefinition<Promise<any>, any, any, any>>>(
    ...definitions: [...TDefinitions]
  ): Promise<AsyncAllInstances<TDefinitions>> =>
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

  override = (definition: BaseDefinition<any, any, any, any>): void => {
    this.containerContext.override(definition);
  };

  provide = <T>(def: BaseDefinition<T, LifeTime.scoped, any, any>, instance: T): void => {
    const override = def.patch().set(instance);
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

export function container(globalOverrides?: BaseDefinition<any, any, any, any>[] | PatchSet): Container;
export function container(options?: ContainerOptions): Container;
export function container(
  overridesOrOptions?: ContainerOptions | Array<BaseDefinition<any, any, any, any>> | PatchSet,
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

export const root = container();

export function use<TInstance, TArgs extends any[]>(
  definition: BaseDefinition<TInstance, LifeTime, unknown, TArgs>,
  ...args: TArgs
) {
  return root.use(definition, ...args);
}
