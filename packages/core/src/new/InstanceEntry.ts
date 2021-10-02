import { ClassType } from '../utils/ClassType';
import { v4 } from 'uuid';

export type InstanceEntry<T, TExternal = never> =
  | ClassInstanceDefinition<T>
  | FunctionFactoryDefinition<T>
  | DecoratorDefinition<T>
  | ConstDefinition<T>;

export const createInstance = <T>(instanceEntry: InstanceEntry<T>, dependencies: any[]): T => {
  switch (instanceEntry.type) {
    case 'class':
      return new instanceEntry.class(...dependencies);
    case 'function':
      return instanceEntry.factory(...dependencies);
    case 'const':
      return instanceEntry.value;
    case 'decorator':
      throw new Error('TODO: Not applicable');
    // return instanceEntry.decorator(createInstance(instanceEntry.decorated, dependencies));
  }
};

export type ClassInstanceDefinition<T> = {
  type: 'class';
  id: string;
  strategy: symbol;
  class: ClassType<T, any>;
  dependencies: Array<InstanceEntry<any>>;
};

// TODO: should be exported as it allows creating custom strategies
export const classDefinition = <T, TDeps extends any[]>(
  klass: ClassType<T, TDeps>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceEntry<TDeps[K]> },
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
  dependencies: Array<InstanceEntry<any>>;
};

export const functionDefinition = <T, TDeps extends any[]>(
  factory: (...args: TDeps) => T,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceEntry<TDeps[K]> },
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
  decorated: InstanceEntry<T>;
};

export type ConstDefinition<T> = {
  type: 'const';
  id: string;
  strategy: symbol;
  value: T;
};
