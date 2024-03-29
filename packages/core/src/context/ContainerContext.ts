import { InstancesStore } from './InstancesStore.js';
import { ContainerScopeOptions } from '../container/Container.js';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { InstancesBuilder } from './abstract/InstancesBuilder.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { Resolution } from '../definitions/abstract/Resolution.js';
import { v4 } from 'uuid';
import { ContextEvents } from '../events/ContextEvents.js';

export type ContainerInterceptor = {
  interceptSync?<T>(definition: InstanceDefinition<T, any>, context: ContainerContext): T;
  interceptAsync?<T>(definition: AsyncInstanceDefinition<T, any>, context: ContainerContext): Promise<T>;
};

export class ContainerContext implements InstancesBuilder {
  static empty(
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    interceptors: ContainerInterceptor = {},
  ) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(
      null,
      instancesEntries,
      InstancesStore.create([]),
      strategiesRegistry,
      interceptors,
      new ContextEvents(),
    );
  }

  static create(
    scopeOverrides: AnyInstanceDefinition<any, any>[],
    globalOverrides: AnyInstanceDefinition<any, any>[],
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
    private readonly interceptors: ContainerInterceptor,
    public readonly events: ContextEvents,
  ) {}

  addScopeOverride(definition: AnyInstanceDefinition<any, any>): void {
    if (this.instancesCache.hasInCurrentScope(definition.id)) {
      throw new Error(
        `Cannot override definition. Instance for id=${definition.id} was already created in the current scope.`,
      );
    }

    this.instancesDefinitionsRegistry.addScopeOverride(definition);
  }

  get<TValue, TExternals>(definition: InstanceDefinition<TValue, any>): TValue;
  get<TValue, TExternals>(definition: AsyncInstanceDefinition<TValue, any>): Promise<TValue>;
  get<TValue, TExternals>(definition: AnyInstanceDefinition<TValue, any>): TValue | Promise<TValue> {
    this.events.onGet.emit({ containerId: this.id, definition });
    return this.buildWithStrategy(definition);
  }

  buildExact<T>(definition: InstanceDefinition<T, any>): T;
  buildExact<T>(definition: AsyncInstanceDefinition<T, any>): Promise<T>;
  buildExact<T>(definition: AnyInstanceDefinition<T, any>): T | Promise<T> {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);

    if (definition.resolution === Resolution.sync && this.interceptors.interceptSync) {
      return this.interceptors.interceptSync(definition, this);
    }

    if (definition.resolution === Resolution.async && this.interceptors.interceptAsync) {
      return this.interceptors.interceptAsync?.(definition, this);
    }

    return patchedInstanceDef.create(this);
  }

  buildWithStrategy = (definition: AnyInstanceDefinition<any, any>) => {
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
}
