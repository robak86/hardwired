import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';

export interface InstancesBuilder {
  readonly id: string;
  /**
   * Returns instance bypassing strategy
   * @param definition
   */
  buildExact(definition: InstanceDefinition<any, any, any>): any;

  /**
   * Returns instance created using corresponding strategy (e.g. including singleton memoization)
   * @param definition
   */
  buildWithStrategy(definition: InstanceDefinition<any, any, any>): any;
}
