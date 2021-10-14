import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { AnyInstanceDefinition } from "../definitions/abstract/AnyInstanceDefinition";

export const set = <T extends AnyInstanceDefinition<TInstance, any>, TInstance>(
  instance: T,
  newValue: TInstance,
): T => {
  return {
    ...instance,
    create: () => newValue,
  };
};
