import { InstancesCache } from '../../context/InstancesCache';
import { InstanceDefinition } from './InstanceDefinition';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry';
import { StrategiesRegistry } from '../collection/StrategiesRegistry';
import { AnyInstanceDefinition } from './AnyInstanceDefinition';

// TODO: Ideally build strategy should be just static object with type and build property (to decrease chances that one will make it stateful)
export abstract class BuildStrategy {
  abstract build(
    definition: AnyInstanceDefinition<any>,
    context: InstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ): any;
}

export abstract class AsyncBuildStrategy {
  abstract build(
    definition: AnyInstanceDefinition<any, any, any>,
    context: InstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ): Promise<any>;
}

export const buildDependencies = (
  definition: InstanceDefinition<any>, // TODO: use correct type
  instancesCache: InstancesCache,
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
    return strategy.build(dep, instancesCache, resolvers, strategiesRegistry);
  });
};

export const buildAsyncDependencies = async (
  definition: AnyInstanceDefinition<any, any, any>,
  instancesCache: InstancesCache,
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
      const strategy = strategiesRegistry.get(dep.strategy);
      return strategy.build(dep, instancesCache, resolvers, strategiesRegistry);
    }),
  );
};
