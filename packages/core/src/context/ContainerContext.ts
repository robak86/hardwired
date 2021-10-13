import { InstancesCache } from './InstancesCache';
import { ContainerScopeOptions, defaultStrategiesRegistry } from '../container/Container';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry';
import { InstanceDefinition, instanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';
import { AsyncInstancesCache } from './AsyncInstancesCache';
import { InstancesBuilder } from './abstract/InstancesBuilder';
import { TransientStrategy } from "../strategies/sync/TransientStrategy";

export class ContainerContext implements InstancesBuilder {
  static empty(strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(
      instancesEntries,
      InstancesCache.create([]),
      AsyncInstancesCache.create([]),
      strategiesRegistry,
    );
  }

  static create(
    scopeOverrides: AnyInstanceDefinition<any, any>[],
    globalOverrides: AnyInstanceDefinition<any, any>[],
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ): ContainerContext {
    const definitionsRegistry = InstancesDefinitionsRegistry.create(scopeOverrides, globalOverrides);

    const syncOverrides = scopeOverrides.filter(instanceDefinition.isSync);
    const asyncOverrides = scopeOverrides.filter(instanceDefinition.isAsync);

    return new ContainerContext(
      definitionsRegistry,
      InstancesCache.create(syncOverrides),
      AsyncInstancesCache.create(asyncOverrides),
      strategiesRegistry,
    );
  }

  constructor(
    private instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private instancesCache: InstancesCache,
    private asyncInstancesCache: AsyncInstancesCache,
    private strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ) {}

  // TODO remove in favor of buildWithStrategy
  // get<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any>): TValue {
  //   return this.buildWithStrategy(instanceDefinition);
  // }


  get<TValue>(instanceDefinition: InstanceDefinition<TValue, void>): TValue;
  get<TValue, TExternalParams>(
      instanceDefinition: InstanceDefinition<TValue, TExternalParams>,
      externals: TExternalParams,
  ): TValue;
  get<TValue>(instanceDefinition: InstanceDefinition<TValue, any>, externals?: any): TValue {
    if (instanceDefinition.externalsIds.length > 0) {
      const scopedContainer = this.childScope({
        scopeOverrides: instanceDefinition.externalsIds.map(externalId => {
          return {
            id: externalId,
            externalsIds: [],
            strategy: TransientStrategy.type,
            create: () => externals,
            isAsync: false,
          };
        }),
      });

      return scopedContainer.get({
        ...instanceDefinition,
        externalsIds: [],
      });
    } else {
      const requestContext = this.checkoutRequestScope();
      return requestContext.buildWithStrategy(instanceDefinition);
    }
  }

  // TODO remove in favor of buildWithStrategy
  getAsync<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any>): Promise<TValue> {
    return this.buildWithStrategy(instanceDefinition);
  }

  buildExact = (definition: AnyInstanceDefinition<any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    return patchedInstanceDef.create(this);
  };

  buildWithStrategy = (definition: AnyInstanceDefinition<any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.build(
      patchedInstanceDef,
      this.instancesCache,
      this.asyncInstancesCache,
      this.instancesDefinitionsRegistry,
      this,
    );
  };

  checkoutRequestScope(): ContainerContext {
    return new ContainerContext(
      this.instancesDefinitionsRegistry.checkoutForRequestScope(),
      this.instancesCache.checkoutForRequestScope(),
      this.asyncInstancesCache.checkoutForRequestScope(),

      this.strategiesRegistry,
    );
  }

  childScope(options: Omit<ContainerScopeOptions, 'globalOverrides'>): ContainerContext {
    const { scopeOverrides = [] } = options;
    const syncOverrides = scopeOverrides.filter(instanceDefinition.isSync);
    const asyncOverrides = scopeOverrides.filter(instanceDefinition.isAsync);

    return new ContainerContext(
      this.instancesDefinitionsRegistry.checkoutForScope(scopeOverrides),
      this.instancesCache.childScope(syncOverrides),
      this.asyncInstancesCache.childScope(asyncOverrides),
      this.strategiesRegistry,
    );
  }
}
