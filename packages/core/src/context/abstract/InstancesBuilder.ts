import { BaseDefinition } from '../../definitions/abstract/FnDefinition.js';

export interface InstancesBuilder {
  readonly id: string;

  buildExactFn(definition: BaseDefinition<any, any, any, any>): any;
}
