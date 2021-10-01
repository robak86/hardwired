import { ClassType } from '../utils/ClassType';

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
      throw new Error("TODO: Not applicable")
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

export type FunctionFactoryDefinition<T> = {
  type: 'function';
  id: string;
  strategy: symbol;
  factory: (...args: any[]) => T;
  dependencies: Array<InstanceEntry<any>>;
};

export type DecoratorDefinition<T> = {
  type: 'decorator';
  id: string;
  strategy: symbol;
  dependencies: any[],
  decorator: (prev: T, ...args:any[]) => T;
  decorated: InstanceEntry<T>;
};

export type ConstDefinition<T> = {
  type: 'const';
  id: string;
  strategy: symbol;
  value: T;
};
