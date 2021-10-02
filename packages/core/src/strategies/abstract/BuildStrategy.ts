import { InstancesCache } from '../../context/InstancesCache';
import { InstanceDefinition } from '../../new/InstanceDefinition';
import { InstancesDefinitionsRegistry } from '../../context/InstancesDefinitionsRegistry';
import { StrategiesRegistry } from '../collection/StrategiesRegistry';


// TODO: Ideally build strategy should be just static object with type and build property (to decrease chances that one will make it stateful)
export abstract class BuildStrategy {
  abstract build(
    definition: InstanceDefinition<any>,
    context: InstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ): any;

  protected buildDependencies(
    definition: InstanceDefinition<any>, // TODO: use correct type
    instancesCache: InstancesCache,
    resolvers: InstancesDefinitionsRegistry,
    strategiesRegistry: StrategiesRegistry,
  ) {
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
  }
}
