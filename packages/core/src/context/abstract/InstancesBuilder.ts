import { AnyDefinition } from '../../definitions/abstract/Definition.js';

export interface InstancesBuilder {
  readonly id: string;

  buildExact(definition: AnyDefinition, ...args: any[]): any;
}
