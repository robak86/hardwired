import { InstancesCache } from '../../context/InstancesCache';
import { InstanceDefinition } from '../../definitions/InstanceDefinition';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry';
import { StrategiesRegistry } from '../collection/StrategiesRegistry';
import { AnyInstanceDefinition } from '../../definitions/AnyInstanceDefinition';
import { AsyncInstancesCache } from '../../context/AsyncInstancesCache';
import { InstancesBuilder } from "../../context/InstancesBuilder";

// TODO: Ideally build strategy should be just static object with type and build property (to decrease chances that one will make it stateful)
export abstract class BuildStrategy {
  // TODO: we should inject also service for instantiating dependencies - this will make creation of custom strategies much easier
  abstract build(
    definition: AnyInstanceDefinition<any, any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache, // only required by service locator because we would like to obtain service locator synchronously and then get some async definitions
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
    instancesBuilder:InstancesBuilder
  ): any;
}

export abstract class AsyncBuildStrategy {
  abstract build(
    definition: AnyInstanceDefinition<any, any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ): Promise<any>;
}
//
// export const buildInstances = (
//   instancesCache: InstancesCache, // TODO: use correct type
//   asyncInstancesCache: AsyncInstancesCache,
//   resolvers: InstancesDefinitionsRegistry,
//   strategiesRegistry: StrategiesRegistry,
//   definitions: InstanceDefinition<any>[],
// ) => {
//   const dependencies = definitions.map(instanceDef => {
//     return resolvers.getInstanceDefinition(instanceDef);
//   });
//
//   return dependencies.map(dep => {
//     const strategy = strategiesRegistry.get(dep.strategy);
//     return strategy.build(dep, instancesCache, asyncInstancesCache, resolvers, strategiesRegistry);
//   });
// };
//
// export const buildInstance = (
//   instancesCache: InstancesCache, // TODO: use correct type
//   asyncInstancesCache: AsyncInstancesCache,
//   resolvers: InstancesDefinitionsRegistry, // TODO: group with object?  {sync, async}
//   strategiesRegistry: StrategiesRegistry,
//   definition: InstanceDefinition<any>,
// ) => {
//   const dependencies = buildInstances(
//     instancesCache,
//     asyncInstancesCache,
//     resolvers,
//     strategiesRegistry,
//     definition.dependencies,
//   );
//
//
//   return definition.create(dependencies);
// };

export const buildAsyncDependencies = async (
  definition: AnyInstanceDefinition<any, any>,
  instancesCache: InstancesCache,
  asyncInstancesCache: AsyncInstancesCache,
  resolvers: InstancesDefinitionsRegistry,
  strategiesRegistry: StrategiesRegistry,
) => {
  // const dependencies = definition.dependencies.map(instanceDef => {
  //   return resolvers.getInstanceDefinition(instanceDef);
  // });

  throw new Error("Implement me!")

  // return Promise.all(
  //   dependencies.map(dep => {
  //     const strategy = strategiesRegistry.getAsync(dep.strategy);
  //     return strategy.build(dep, instancesCache, asyncInstancesCache, resolvers, strategiesRegistry);
  //   }),
  // );
};

export const buildAsyncInstance = async (
  definition: InstanceDefinition<any>,
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

  throw new Error("Implement me!")
  // return definition.create(dependencies);
};
