import { ClassInstanceDefinition } from './InstanceDefinition/ClassInstanceDefinition';
import { FunctionFactoryDefinition } from './InstanceDefinition/FunctionDefinition';
import { DecoratorDefinition } from './InstanceDefinition/DecoratorDefinition';
import { ConstDefinition } from './InstanceDefinition/ConstDefinition';
import { PartiallyAppliedFunctionDefinition } from './InstanceDefinition/PartiallyAppliedFunctionDefinition';

export type InstanceDefinition<T, TMeta = never, TExternal = never> =
  | ClassInstanceDefinition<T, TMeta, TExternal>
  | FunctionFactoryDefinition<T, TMeta, TExternal>
  | DecoratorDefinition<T, TMeta, TExternal>
  | ConstDefinition<T, TMeta, TExternal>
  | PartiallyAppliedFunctionDefinition<T, TMeta, TExternal>;

export const createInstance = <T>(instanceDefinition: InstanceDefinition<T>, dependencies: any[]): T => {
  switch (instanceDefinition.type) {
    case 'class':
      return new instanceDefinition.class(...dependencies);
    case 'function':
      return instanceDefinition.factory(...dependencies);
    case 'const':
      return instanceDefinition.value;
    case 'partiallyApplied':
      if (instanceDefinition.fn.length === 0) {
        return instanceDefinition.fn as any;
      } else {
        return instanceDefinition.fn.bind(null, ...dependencies) as any;
      }

    case 'decorator':
      throw new Error('TODO: Not applicable');
    // return instanceDefinition.decorator(createInstance(instanceDefinition.decorated, dependencies));
  }
};
