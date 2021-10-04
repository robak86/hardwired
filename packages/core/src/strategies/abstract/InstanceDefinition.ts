import { ClassDefinition } from './InstanceDefinition/BuildClassDefinition';
import { FunctionFactoryDefinition } from './InstanceDefinition/FunctionDefinition';
import { DecoratorDefinition } from './InstanceDefinition/DecoratorDefinition';
import { ConstDefinition } from './InstanceDefinition/ConstDefinition';
import { PartiallyAppliedFunctionDefinition } from './InstanceDefinition/PartiallyAppliedFunctionDefinition';
import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import invariant from 'tiny-invariant';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';

export type InstanceDefinition<T, TExternal = never> =
  | ClassDefinition<T, TExternal>
  | FunctionFactoryDefinition<T, TExternal>
  | DecoratorDefinition<T, TExternal>
  | ConstDefinition<T, TExternal>
  | PartiallyAppliedFunctionDefinition<T, TExternal>;

const syncTypes: InstanceDefinition<any>['type'][] = ['const', 'class', 'function', 'decorator', 'partiallyApplied'];
const asyncTypes: AsyncInstanceDefinition<any, any>['type'][] = [
  'asyncClass',
  'asyncFunction',
  'asyncDecorator',
  'asyncPartiallyApplied',
];

export const instanceDefinition = {
  isAsync(val: AnyInstanceDefinition<any, any>): val is AsyncInstanceDefinition<any, any> {
    return asyncTypes.includes(val.type as any);
  },
  isSync(val: AnyInstanceDefinition<any, any>): val is InstanceDefinition<any, any> {
    return syncTypes.includes(val.type as any);
  },
};

export const createInstance = <T>(instanceDefinition: AnyInstanceDefinition<T, any>, dependencies: any[]): T => {
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
