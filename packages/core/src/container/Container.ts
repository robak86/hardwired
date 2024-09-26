import { ContainerContext } from '../context/ContainerContext.js';
import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { AsyncAllInstances, IContainer, IContainerScopes, UseFn } from './IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { ContextEvents } from '../events/ContextEvents.js';
import { ContainerInterceptor } from '../context/ContainerInterceptor.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { Overrides } from './Overrides.js';
import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';

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

  checkoutScope = (options: ScopeOptions = {}): IContainer =>
    new Container(this.containerContext.checkoutScope(options));

  withScope: IContainerScopes['withScope'] = (fnOrOptions, fn?: any) => {
    if (typeof fnOrOptions === 'function') {
      return fnOrOptions(this.checkoutScope());
    } else {
      return fn!(this.checkoutScope(fnOrOptions));
    }
  };

  override = (definition: BaseDefinition<any, any, any, any>): void => {
    this.containerContext.override(definition);
  };

  provide = <T>(def: BaseDefinition<T, LifeTime.scoped, any, any>, instance: T): void => {
    const override = def.bindValue(instance);
    return this.override(override);
  };
}

export type ScopeOptions = {
  final?: Overrides; // propagated to descendant containers
  scope?: Overrides;
  interceptor?: ContainerInterceptor;
};

export function container(globalOverrides?: BaseDefinition<any, any, any, any>[]): Container;
export function container(options?: ScopeOptions): Container;
export function container(overridesOrOptions?: ScopeOptions | Array<BaseDefinition<any, any, any, any>>): Container {
  if (Array.isArray(overridesOrOptions)) {
    return new Container(ContainerContext.create([], overridesOrOptions, defaultStrategiesRegistry));
  } else {
    return new Container(
      ContainerContext.create(
        overridesOrOptions?.scope ?? [],
        overridesOrOptions?.final ?? [],
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
