import { ClassInstanceDefinition } from "./InstanceDefinition/ClassInstanceDefinition";
import { FunctionFactoryDefinition } from "./InstanceDefinition/FunctionDefinition";
import { DecoratorDefinition } from "./InstanceDefinition/DecoratorDefinition";
import { ConstDefinition } from "./InstanceDefinition/ConstDefinition";

export type InstanceDefinition<T, TExternal = never> =
  | ClassInstanceDefinition<T>
  | FunctionFactoryDefinition<T>
  | DecoratorDefinition<T>
  | ConstDefinition<T>;

export const createInstance = <T>(instanceDefinition: InstanceDefinition<T>, dependencies: any[]): T => {
  switch (instanceDefinition.type) {
    case 'class':
      return new instanceDefinition.class(...dependencies);
    case 'function':
      return instanceDefinition.factory(...dependencies);
    case 'const':
      return instanceDefinition.value;
    case 'decorator':
      throw new Error('TODO: Not applicable');
    // return instanceDefinition.decorator(createInstance(instanceDefinition.decorated, dependencies));
  }
};

