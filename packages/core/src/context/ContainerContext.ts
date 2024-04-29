import { InstancesStore } from './InstancesStore.js';
import { ContainerScopeOptions } from '../container/Container.js';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { InstancesBuilder } from './abstract/InstancesBuilder.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { Resolution } from '../definitions/abstract/Resolution.js';
import { v4 } from 'uuid';
import { ContextEvents } from '../events/ContextEvents.js';
import { ContainerInterceptor } from './ContainerInterceptor.js';
import { IContainerScopes, InstanceCreationAware, IServiceLocator } from '../container/IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export class ContainerContext implements InstancesBuilder, InstanceCreationAware, IContainerScopes {
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
    scopeOverrides: AnyInstanceDefinition<any, any, any>[],
    globalOverrides: AnyInstanceDefinition<any, any, any>[],
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
  ) {}

  override(definition: AnyInstanceDefinition<any, any, any>): void {
    if (this.instancesCache.hasInCurrentScope(definition.id)) {
      throw new Error(
        `Cannot override definition. Instance for id=${definition.id} was already created in the current scope.`,
      );
    }

    this.instancesDefinitionsRegistry.addScopeOverride(definition);
  }

  use<TValue>(definition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue>(definition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  use<TValue>(definition: AnyInstanceDefinition<TValue, any, any>): TValue | Promise<TValue> {
    this.events.onGet.emit({ containerId: this.id, definition });

    this.interceptor.onRequestStart?.(definition, this);

    const instance = this.buildWithStrategy(definition);

    if (definition.resolution === Resolution.async) {
      if (this.interceptor.onAsyncRequestEnd) {
        return this.interceptor.onAsyncRequestEnd(definition, this, instance).then(() => instance);
      } else {
        return instance;
      }
    } else {
      this.interceptor.onRequestEnd?.(definition, this, instance);
      return instance;
    }
  }

  useAll<TDefinitions extends InstanceDefinition<any, any, any>[]>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.useAll(def)) as any;
  }

  buildExact<T>(definition: InstanceDefinition<T, any, any>): T;
  buildExact<T>(definition: AsyncInstanceDefinition<T, any, any>): Promise<T>;
  buildExact<T>(definition: AnyInstanceDefinition<T, any, any>): T | Promise<T> {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);

    this.interceptor.onDefinitionEnter?.(patchedInstanceDef);

    if (patchedInstanceDef.resolution === Resolution.sync && this.interceptor.interceptSync) {
      // TODO: this doesn't make any sense as the value from previous interceptor might be completely ignored
      return this.interceptor.interceptSync(patchedInstanceDef, this);
    }

    if (patchedInstanceDef.resolution === Resolution.async && this.interceptor.interceptAsync) {
      // TODO: this doesn't make any sense as the value from previous interceptor might be completely ignored
      return this.interceptor.interceptAsync?.(patchedInstanceDef, this);
    }

    return patchedInstanceDef.create(this);
  }

  buildWithStrategy = (definition: AnyInstanceDefinition<any, any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.build(patchedInstanceDef, this.instancesCache, this.instancesDefinitionsRegistry, this);
  };

  checkoutScope(options: Omit<ContainerScopeOptions, 'globalOverrides'> = {}): ContainerContext {
    const { overrides = [] } = options;

    const scopeContext = new ContainerContext(
      this.id,
      this.instancesDefinitionsRegistry.checkoutForScope(overrides),
      this.instancesCache.childScope(overrides),
      this.strategiesRegistry,
      options.interceptor || {},
      this.events,
    );

    this.events.onScope.emit({ initiatorContainerId: this.id, scopeContainerId: scopeContext.id });

    return scopeContext;
  }

  withScope<TValue>(fn: (locator: IServiceLocator<LifeTime>) => TValue): TValue {
    const scopeContext = this.checkoutScope();

    return fn(scopeContext);
  }

  provide<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: T) {
    throw new Error('Implement me!');
  }
}
