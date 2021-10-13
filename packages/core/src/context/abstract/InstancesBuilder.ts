import { AnyInstanceDefinition } from '../../definitions/abstract/AnyInstanceDefinition';

export interface InstancesBuilder {
  buildExact(definition: AnyInstanceDefinition<any>): any;
  buildWithStrategy(definition: AnyInstanceDefinition<any, any>): any;
}
