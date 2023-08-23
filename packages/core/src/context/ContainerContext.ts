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
  interceptSync?<T>(instance: T, definition: InstanceDefinition<T, any>, context: InstancesBuilder): T;
  interceptAsync?<T>(instance: T, definition: AsyncInstanceDefinition<T, any>, context: InstancesBuilder): Promise<T>;
  interceptScopeCreate?(currentContext: ContainerContext): ContainerContext;
};

export class ContainerContext implements InstancesBuilder {
  static empty(
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    interceptors: ContainerInterceptor = {},
  ) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(
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
      definitionsRegistry,
      InstancesStore.create(scopeOverrides),
      strategiesRegistry,
      interceptors,
      new ContextEvents(),
    );
  }

  public readonly id = v4();

  constructor(
    private instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private instancesCache: InstancesStore,
    private strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    private interceptors: ContainerInterceptor,
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

  buildExact = (definition: AnyInstanceDefinition<any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    const instance = patchedInstanceDef.create(this);

    if (definition.resolution === Resolution.sync && this.interceptors.interceptSync) {
      return this.interceptors.interceptSync(instance, definition, this);
    }

    if (definition.resolution === Resolution.async && this.interceptors.interceptAsync) {
      return Promise.resolve(instance).then(instance => this.interceptors.interceptAsync?.(instance, definition, this));
    }

    return instance;
  };

  buildWithStrategy = (definition: AnyInstanceDefinition<any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.build(patchedInstanceDef, this.instancesCache, this.instancesDefinitionsRegistry, this);
  };

  checkoutScope(options: Omit<ContainerScopeOptions, 'globalOverrides'> = {}): ContainerContext {
    const { overrides = [] } = options;

    const scopeContext = new ContainerContext(
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
