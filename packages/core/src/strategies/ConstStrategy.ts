import { BuildStrategy} from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { StrategiesRegistry } from "./collection/StrategiesRegistry";
import { ConstDefinition } from "./abstract/InstanceDefinition/ConstDefinition";

export class ConstStrategy extends BuildStrategy {
  static type = Symbol.for('constStrategy');

  build(
    definition: ConstDefinition<any>,
    instancesCache: InstancesCache,
    resolvers,
    strategiesRegistry: StrategiesRegistry,
  ) {
    return definition.value;
  }
}
