import { ClassType } from '../utils/ClassType';
import { v4 } from 'uuid';

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

export type ClassInstanceDefinition<T> = {
  type: 'class';
  id: string;
  strategy: symbol;
  class: ClassType<T, any>;
  dependencies: Array<InstanceDefinition<any>>;
};

// TODO: should be exported as it allows creating custom strategies
export const classDefinition = <T, TDeps extends any[]>(
  klass: ClassType<T, TDeps>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
): ClassInstanceDefinition<T> => {
  return {
    type: 'class',
    id: v4(),
    strategy,
    class: klass,
    dependencies,
  };
};

export type FunctionFactoryDefinition<T> = {
  type: 'function';
  id: string;
  strategy: symbol;
  factory: (...args: any[]) => T;
  dependencies: Array<InstanceDefinition<any>>;
};

export const functionDefinition = <T, TDeps extends any[]>(
  factory: (...args: TDeps) => T,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
): FunctionFactoryDefinition<T> => {
  return {
    type: 'function',
    id: `${factory.name}:${v4()}`,
    strategy,
    factory: factory as any,
    dependencies,
  };
};

export type DecoratorDefinition<T> = {
  type: 'decorator';
  id: string;
  strategy: symbol;
  dependencies: any[];
  decorator: (prev: T, ...args: any[]) => T;
  decorated: InstanceDefinition<T>;
};

export type ConstDefinition<T> = {
  type: 'const';
  id: string;
  strategy: symbol;
  value: T;
};
