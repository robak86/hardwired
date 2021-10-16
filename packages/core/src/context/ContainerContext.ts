import { InstancesStore } from './InstancesStore';
import { ContainerScopeOptions, defaultStrategiesRegistry } from '../container/Container';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry';
import { InstanceDefinition, instanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';
import { AsyncInstancesStore } from './AsyncInstancesStore';
import { InstancesBuilder } from './abstract/InstancesBuilder';
import { TransientStrategy } from '../strategies/sync/TransientStrategy';
import { LifeTime} from "../definitions/abstract/LifeTime";
import { Resolution } from "../definitions/abstract/Resolution";

export class ContainerContext implements InstancesBuilder {
  static empty(strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(
      instancesEntries,
      InstancesStore.create([]),
      AsyncInstancesStore.create([]),
      strategiesRegistry,
    );
  }

  static create(
    scopeOverrides: AnyInstanceDefinition<any, any, any>[],
    globalOverrides: AnyInstanceDefinition<any, any, any>[],
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ): ContainerContext {
    const definitionsRegistry = InstancesDefinitionsRegistry.create(scopeOverrides, globalOverrides);

    const syncOverrides = scopeOverrides.filter(instanceDefinition.isSync);
    const asyncOverrides = scopeOverrides.filter(instanceDefinition.isAsync);

    return new ContainerContext(
      definitionsRegistry,
      InstancesStore.create(syncOverrides),
      AsyncInstancesStore.create(asyncOverrides),
      strategiesRegistry,
    );
  }

  constructor(
    private instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private instancesCache: InstancesStore,
    private asyncInstancesCache: AsyncInstancesStore,
    private strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ) {}

  get<TValue, TExternalParams extends any[]>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternalParams>,
    ...externals: TExternalParams
  ): TValue {
    if (externals.length !== instanceDefinition.externals.length) {
      throw new Error('Invalid external params count');
    }

    if (instanceDefinition.externals.length > 0) {
      const scopedContainer = this.checkoutScope({
        scopeOverrides: instanceDefinition.externals.map((externalDef, idx) => {
          return {
            id: externalDef.id,
            externals: [],
            strategy: LifeTime.transient,
            create: () => externals[idx],
            resolution: Resolution.sync,
          };
        }),
      });

      return scopedContainer.get({
        ...instanceDefinition,
        externals: [],
      } as any);
    } else {
      const requestContext = this.checkoutRequestScope();
      return requestContext.buildWithStrategy(instanceDefinition);
    }
  }

  getAsync<TValue, TExternalParams extends any[]>(
    instanceDefinition: AnyInstanceDefinition<TValue, any, TExternalParams>,
    ...externalParams: TExternalParams
  ): Promise<TValue> {
    if (instanceDefinition.externals.length > 0) {
      const scopedContainer = this.checkoutScope({
        scopeOverrides: instanceDefinition.externals.map((externalDef, idx) => {
          return {
            id: externalDef.id,
            externals: [],
            strategy: LifeTime.transient,
            create: () => externalParams[idx],
            resolution: Resolution.sync,
          };
        }),
      });

      return scopedContainer.getAsync({
        ...instanceDefinition,
        externals: [],
      } as any);
    } else {
      const requestContext = this.checkoutRequestScope();
      return requestContext.buildWithStrategy(instanceDefinition);
    }

    // return this.buildWithStrategy(instanceDefinition);
  }

  buildExact = (definition: AnyInstanceDefinition<any, any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    return patchedInstanceDef.create(this);
  };

  buildWithStrategy = (definition: AnyInstanceDefinition<any, any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy, definition.resolution);

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

  checkoutScope(options: Omit<ContainerScopeOptions, 'globalOverrides'> = {}): ContainerContext {
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
