import { BuildStrategyNew, StrategiesRegistry } from './abstract/_BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { DecoratorDefinition } from '../new/InstanceEntry';

export class DecoratorStrategy extends BuildStrategyNew {
  static type = Symbol.for('decorator');

  build(
    definition: DecoratorDefinition<any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    const strategy = strategiesRegistry.get(definition.decorated.strategy);
    const decorateTarget = strategy.build(definition.decorated, instancesCache, resolvers, strategiesRegistry);

    return definition.decorator(decorateTarget); // TODO: this is still not correct -  new instance of decorated definition is always created
  }
}
