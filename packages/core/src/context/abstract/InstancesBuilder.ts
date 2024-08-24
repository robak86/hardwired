import { AnyInstanceDefinition } from '../../definitions/abstract/AnyInstanceDefinition.js';
import { BaseDefinition } from '../../definitions/abstract/FnDefinition.js';

export interface InstancesBuilder {
  readonly id: string;
  /**
   * Returns instance bypassing strategy
   * @param definition
   */
  buildExact(definition: AnyInstanceDefinition<any, any, any>): any;
  buildExactFn(definition: BaseDefinition<any, any, any>): any;
}
