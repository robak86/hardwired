import { InstancesStore } from './InstancesStore.js';
import { ContainerOptions } from '../container/Container.js';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { InstancesBuilder } from './abstract/InstancesBuilder.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { v4 } from 'uuid';
import { ContextEvents } from '../events/ContextEvents.js';
import { ContainerInterceptor } from './ContainerInterceptor.js';
import { IContainerScopes, InstanceCreationAware, UseFn } from '../container/IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { Overrides } from '../container/Overrides.js';
import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';

export interface ContainerContext extends UseFn {}

export class ContainerContext
  extends ExtensibleFunction
  implements InstancesBuilder, InstanceCreationAware, IContainerScopes
{
  static empty(
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    interceptor: ContainerInterceptor = {},
  ) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(
      null,
      instancesEntries,
      InstancesStore.create([]),
      strategiesRegistry,
      interceptor,
      new ContextEvents(),
    );
  }

  static create(
    scopeOverrides: Overrides,
    globalOverrides: Overrides,
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    interceptors: ContainerInterceptor = {},
  ): ContainerContext {
    const definitionsRegistry = InstancesDefinitionsRegistry.create(scopeOverrides, globalOverrides);

    return new ContainerContext(
      null,
      definitionsRegistry,
      InstancesStore.create(scopeOverrides),
      strategiesRegistry,
      interceptors,
      new ContextEvents(),
    );
  }

  public readonly id = v4();

  constructor(
    public readonly parentId: string | null,
    private readonly instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private readonly instancesCache: InstancesStore,
    private readonly strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    private readonly interceptor: ContainerInterceptor,
    public readonly events: ContextEvents,
  ) {
    super((definition: BaseDefinition<any, any, any, any>, ...args: any[]) => {
      return this.request(definition as any, ...args); // TODO: fix type
    });
  }

  override(definition: BaseDefinition<any, any, any, any>): void {
    if (this.instancesCache.hasInCurrentScope(definition.id)) {
      throw new Error(
        `Cannot override definition. Instance for id=${definition.id} was already created in the current scope.`,
      );
    }

    this.instancesDefinitionsRegistry.addScopeOverride(definition);
  }

  request<TValue>(instanceDefinition: BaseDefinition<TValue, LifeTime.scoped | LifeTime.singleton, any, []>): TValue;
  request<TValue, TArgs extends any[]>(
    instanceDefinition: BaseDefinition<TValue, LifeTime.transient, any, TArgs>,
    ...args: TArgs
  ): TValue;
  request<TValue, TArgs extends []>(
    definition: BaseDefinition<TValue, any, any, any>,
    ...args: TArgs
  ): Promise<TValue> | TValue {
    this.events.onGet.emit({ containerId: this.id, definition });
    this.interceptor.onRequestStart?.(definition, this);

    const instance = this.use(definition, ...args);

    this.interceptor.onRequestEnd?.(definition, this, instance);
    return instance;
  }

  all<TDefinitions extends Array<BaseDefinition<any, any, any, []>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.use(def)) as any;
  }

  buildExact<T>(definition: BaseDefinition<T, any, any, any>, ...args: any[]): T {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getDefinition(definition);

    this.interceptor.onDefinitionEnter?.(patchedInstanceDef);

    if (this.interceptor.interceptSync) {
      // TODO: this doesn't make any sense as the value from previous interceptor might be completely ignored
      return this.interceptor.interceptSync(patchedInstanceDef, this);
    }

    return patchedInstanceDef.create(this, ...args);
  }

  use = (definition: BaseDefinition<any, any, any, any>, ...args: any[]) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.buildFn(patchedInstanceDef, this.instancesCache, this.instancesDefinitionsRegistry, this, ...args);
  };

  checkoutScope = (options: ContainerOptions = {}): ContainerContext => {
    const { scope = [], final = [] } = options;

    const scopeContext = new ContainerContext(
      this.id,
      this.instancesDefinitionsRegistry.checkoutForScope(scope, final),
      this.instancesCache.childScope(scope),
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

  provide = <T>(def: BaseDefinition<T, LifeTime.scoped, any, any>, instance: T) => {
    throw new Error('Implement me!');
  };
}
