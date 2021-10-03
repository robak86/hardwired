import { buildDependencies, BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { DecoratorDefinition } from './abstract/InstanceDefinition/DecoratorDefinition';

export class DecoratorStrategy extends BuildStrategy {
  static type = Symbol.for('decorator');

  build(
    definition: DecoratorDefinition<any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const strategy = strategiesRegistry.get(definition.decorated.strategy);
    const decorateTarget = strategy.build(definition.decorated, instancesCache, resolvers, strategiesRegistry);
    const dependencies = buildDependencies(definition, instancesCache, resolvers, strategiesRegistry) as any;

    return definition.decorator(decorateTarget, ...dependencies); // TODO: this is still not correct -  new instance of decorated definition is always created
  }
}
