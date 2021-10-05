import { buildDependencies, BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';
import { InstanceDefinition } from "./abstract/InstanceDefinition";

export class DecoratorStrategy extends BuildStrategy {
  static type = Symbol.for('decorator');

  build(
    definition: InstanceDefinition<any>,
    instancesCache: InstancesCache,
    asyncInstancesCache: AsyncInstancesCache,

    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    throw new Error("Implement me!")
    // const strategy = strategiesRegistry.get(definition.decorated.strategy);
    // const decorateTarget = strategy.build(
    //   definition.decorated,
    //   instancesCache,
    //   asyncInstancesCache,
    //   resolvers,
    //   strategiesRegistry,
    // );
    // const dependencies = buildDependencies(
    //   definition,
    //   instancesCache,
    //   asyncInstancesCache,
    //   resolvers,
    //   strategiesRegistry,
    // ) as any;
    //
    // return definition.decorator(decorateTarget, ...dependencies); // TODO: this is still not correct -  new instance of decorated definition is always created
  }
}
