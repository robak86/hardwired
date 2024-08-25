import { BaseDefinition } from '../../definitions/abstract/FnDefinition.js';

export interface InstancesBuilder {
  readonly id: string;

  buildExact(definition: BaseDefinition<any, any, any, any>, ...args: any[]): any;
}
