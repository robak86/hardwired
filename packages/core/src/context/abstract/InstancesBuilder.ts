import { AnyInstanceDefinition } from '../../definitions/abstract/AnyInstanceDefinition.js';

export interface InstancesBuilder {
  buildExact(definition: AnyInstanceDefinition<any, any>): any;
  buildWithStrategy(definition: AnyInstanceDefinition<any, any>): any;
}
