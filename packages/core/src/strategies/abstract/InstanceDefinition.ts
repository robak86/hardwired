import { ClassDefinition } from './InstanceDefinition/BuildClassDefinition';
import { FunctionFactoryDefinition } from './InstanceDefinition/FunctionDefinition';
import { DecoratorDefinition } from './InstanceDefinition/DecoratorDefinition';
import { ConstDefinition } from './InstanceDefinition/ConstDefinition';
import { PartiallyAppliedFunctionDefinition } from './InstanceDefinition/PartiallyAppliedFunctionDefinition';
import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import invariant from 'tiny-invariant';

export type InstanceDefinition<T, TMeta = never, TExternal = never> =
  | ClassDefinition<T, TMeta, TExternal>
  | FunctionFactoryDefinition<T, TMeta, TExternal>
  | DecoratorDefinition<T, TMeta, TExternal>
  | ConstDefinition<T, TMeta, TExternal>
  | PartiallyAppliedFunctionDefinition<T, TMeta, TExternal>;

export const createInstance = <T>(instanceDefinition: AnyInstanceDefinition<T, any, any>, dependencies: any[]): T => {
  switch (instanceDefinition.type) {
    case 'class':
    case 'asyncClass':
      return new instanceDefinition.class(...dependencies);
    case 'function':
    case 'asyncFunction':
      return instanceDefinition.factory(...dependencies);
    case 'const':
      return instanceDefinition.value;
    case 'asyncPartiallyApplied':
    case 'partiallyApplied':
      invariant(
        typeof instanceDefinition.fn === 'function',
        `Invalid param. Expected function got ${instanceDefinition}`,
      );

      if (instanceDefinition.fn.length === 0) {
        return instanceDefinition.fn;
      } else {
        return instanceDefinition.fn.bind(null, ...dependencies);
      }

    case 'asyncDecorator':
    case 'decorator':
      throw new Error('TODO: Not applicable');
    // return instanceDefinition.decorator(createInstance(instanceDefinition.decorated, dependencies));
  }
};
