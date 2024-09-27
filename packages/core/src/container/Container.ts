import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { AsyncAllInstances, IContainer, IContainerScopes, InstanceCreationAware, UseFn } from './IContainer.js';

import { ContextEvents } from '../events/ContextEvents.js';
import { ContainerInterceptor } from '../context/ContainerInterceptor.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { Overrides } from './Overrides.js';
import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { v4 } from 'uuid';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export interface Container extends UseFn<LifeTime> {}

export class Container
  extends ExtensibleFunction
  implements InstancesBuilder, InstanceCreationAware, IContainerScopes, IContainer
{
  static empty(
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    interceptor: ContainerInterceptor = {},
  ) {
    const instancesEntries = BindingsRegistry.empty();

    return new Container(
      null,
      instancesEntries,
      InstancesStore.create([]),
      strategiesRegistry,
      interceptor,
      new ContextEvents(),
    );
  }

  static create(options: ScopeOptions, strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry): Container {
    const definitionsRegistry = BindingsRegistry.create(options);

    return new Container(
      null,
      definitionsRegistry,
      InstancesStore.create(options.scope ?? []),
      strategiesRegistry,
      options.interceptor ?? {},
      new ContextEvents(),
    );
  }

  public readonly id = v4();

  constructor(
    public readonly parentId: string | null,
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly instancesStore: InstancesStore,
    private readonly strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    private readonly interceptor: ContainerInterceptor,
    public readonly events: ContextEvents,
  ) {
    super((definition: BaseDefinition<any, any, any>, ...args: any[]) => {
      return this.use(definition as any, ...args); // TODO: fix type
    });
  }

  new(options: ScopeOptions = {}): IContainer {
    return Container.create(options, defaultStrategiesRegistry);
  }

  // request<TValue>(instanceDefinition: BaseDefinition<TValue, LifeTime.scoped | LifeTime.singleton, []>): TValue;
  // request<TValue, TArgs extends any[]>(
  //   instanceDefinition: BaseDefinition<TValue, LifeTime.transient, TArgs>,
  //   ...args: TArgs
  // ): TValue;
  // request<TValue, TArgs extends []>(
  //   definition: BaseDefinition<TValue, any, any>,
  //   ...args: TArgs
  // ): Promise<TValue> | TValue {
  //   this.events.onGet.emit({ containerId: this.id, definition });
  //   this.interceptor.onRequestStart?.(definition, this);
  //
  //   const instance = this.use(definition, ...args);
  //
  //   this.interceptor.onRequestEnd?.(definition, this, instance);
  //   return instance;
  // }

  buildExact<T>(definition: BaseDefinition<T, any, any>, ...args: any[]): T {
    const patchedInstanceDef = this.bindingsRegistry.getDefinition(definition);

    this.interceptor.onDefinitionEnter?.(patchedInstanceDef);

    if (this.interceptor.interceptSync) {
      // TODO: this doesn't make any sense as the value from previous interceptor might be completely ignored
      return this.interceptor.interceptSync(patchedInstanceDef, this);
    }

    return patchedInstanceDef.create(this, ...args);
  }

  all = <TDefinitions extends Array<BaseDefinition<any, any, []>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> => {
    return definitions.map(def => this.use(def)) as InstancesArray<TDefinitions>;
  };

  allAsync = <TDefinitions extends Array<BaseDefinition<Promise<any>, any, []>>>(
    ...definitions: [...TDefinitions]
  ): Promise<AsyncAllInstances<TDefinitions>> => {
    return Promise.all(definitions.map(def => this.use(def)) as AsyncAllInstances<TDefinitions>);
  };

  use: UseFn<LifeTime> = (definition, ...args) => {
    const patchedInstanceDef = this.bindingsRegistry.getDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.buildFn(patchedInstanceDef, this.instancesStore, this.bindingsRegistry, this, ...args);
  };

  checkoutScope: IContainerScopes['checkoutScope'] = (options = {}): IContainer => {
    const { scope = [], final = [] } = options;

    const scopeContext = new Container(
      this.id,
      this.bindingsRegistry.checkoutForScope(scope, final),
      this.instancesStore.childScope(scope),
      this.strategiesRegistry,
      options.interceptor || {},
      this.events,
    );

    this.events.onScope.emit({ initiatorContainerId: this.id, scopeContainerId: scopeContext.id });

    return scopeContext;
  };

  withScope: IContainerScopes['withScope'] = (fnOrOptions, fn?: any) => {
    if (typeof fnOrOptions === 'function') {
      return fnOrOptions(this.checkoutScope());
    } else {
      return fn!(this.checkoutScope(fnOrOptions));
    }
  };
}

export type ScopeOptions = {
  final?: Overrides; // propagated to descendant containers
  scope?: Overrides;
  interceptor?: ContainerInterceptor;
};

export const container = Container.empty();
