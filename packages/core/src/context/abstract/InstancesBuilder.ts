import { Definition } from '../../definitions/abstract/Definition.js';

export interface InstancesBuilder {
  readonly id: string;

  buildExact(definition: Definition<any, any, any>, ...args: any[]): any;
}
