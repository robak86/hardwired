import { AnyInstanceDefinition } from '../../definitions/abstract/AnyInstanceDefinition.js';

export interface InstancesBuilder {
  readonly id: string;
  /**
   * Returns instance bypassing strategy
   * @param definition
   */
  buildExact(definition: AnyInstanceDefinition<any, any, any>): any;

  /**
   * Returns instance created using corresponding strategy (e.g. including singleton memoization)
   * @param definition
   */
  buildWithStrategy(definition: AnyInstanceDefinition<any, any, any>): any;
}
