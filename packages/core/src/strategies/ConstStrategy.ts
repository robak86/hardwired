import { BuildStrategyNew, StrategiesRegistry } from './abstract/_BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { InstanceEntry } from '../new/InstanceEntry';

export class ConstStrategy extends BuildStrategyNew {
  static type = Symbol.for('constStrategy');

  build(
    definition: InstanceEntry<any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    return definition.target;
  }
}
