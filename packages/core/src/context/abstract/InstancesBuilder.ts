import { InstanceDefinition } from '../../definitions/abstract/InstanceDefinition.js';

export interface InstancesBuilder {
  /**
   * Returns instance bypassing strategy
   * @param definition
   */
  buildExact(definition: InstanceDefinition<any, any, any>): any;
}
