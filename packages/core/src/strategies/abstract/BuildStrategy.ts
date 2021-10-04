import { InstancesCache } from '../../context/InstancesCache';
import { createInstance, InstanceDefinition } from './InstanceDefinition';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry';
import { StrategiesRegistry } from '../collection/StrategiesRegistry';
import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { AsyncInstancesCache } from '../../context/AsyncInstancesCache';

// TODO: Ideally build strategy should be just static object with type and build property (to decrease chances that one will make it stateful)
export abstract class BuildStrategy {
  abstract build(
    definition: AnyInstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache, // only required by service locator because we would like to obtain service locator synchronously and then get some async definitions
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ): any;
}

export abstract class AsyncBuildStrategy {
  abstract build(
    definition: AnyInstanceDefinition<any, any, any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ): Promise<any>;
}

export const buildDependencies = (
  definition: InstanceDefinition<any>, // TODO: use correct type
  instancesCache: InstancesCache,
  asyncInstancesCache: AsyncInstancesCache,
  resolvers: InstancesDefinitionsRegistry,
  strategiesRegistry: StrategiesRegistry,
) => {
  if (definition.type === 'const') {
    return [];
  }

  const dependencies = definition.dependencies.map(instanceDef => {
    return resolvers.getInstanceDefinition(instanceDef);
  });

  return dependencies.map(dep => {
    const strategy = strategiesRegistry.get(dep.strategy);
    return strategy.build(dep, instancesCache, asyncInstancesCache, resolvers, strategiesRegistry);
  });
};

export const buildAsyncDependencies = async (
  definition: AnyInstanceDefinition<any, any, any>,
  instancesCache: InstancesCache,
  asyncInstancesCache: AsyncInstancesCache,
  resolvers: InstancesDefinitionsRegistry,
  strategiesRegistry: StrategiesRegistry,
) => {
  if (definition.type === 'const') {
    return [];
  }

  const dependencies = definition.dependencies.map(instanceDef => {
    return resolvers.getInstanceDefinition(instanceDef);
  });

  return Promise.all(
    dependencies.map(dep => {
      const strategy = strategiesRegistry.getAsync(dep.strategy);
      return strategy.build(dep, instancesCache, asyncInstancesCache, resolvers, strategiesRegistry);
    }),
  );
};

export const buildAsyncInstance = async (
  definition: AnyInstanceDefinition<any, any, any>,
  instancesCache: InstancesCache,
  asyncInstancesCache: AsyncInstancesCache,
  resolvers: InstancesDefinitionsRegistry,
  strategiesRegistry: StrategiesRegistry,
) => {
  const dependencies = await buildAsyncDependencies(
    definition,
    instancesCache,
    asyncInstancesCache,
    resolvers,
    strategiesRegistry,
  );
  return createInstance(definition, dependencies);
};
