import { ClassType } from '../utils/ClassType';

export type InstanceEntry<T, TExternal = never> =
  | ClassInstanceDefinition<T>
  | FunctionFactoryDefinition<T>
  | DecoratorDefinition<T>
  | ConstDefinition<T>;

export const createInstance = <T>(instanceEntry: InstanceEntry<T>, dependencies: any[]): T => {
  switch (instanceEntry.kind) {
    case 'class':
      return new instanceEntry.class(...dependencies);
    case 'functionFactory':
      return instanceEntry.factory(...dependencies);
    case 'const':
      return instanceEntry.value;
    case 'decorator':
      return instanceEntry.decorator(createInstance(instanceEntry.decorated, dependencies));
  }
};

export type ClassInstanceDefinition<T> = {
  kind: 'class';
  id: string;
  strategy: symbol;
  class: ClassType<T, any>;
  dependencies: Array<InstanceEntry<any>>;
};

export type FunctionFactoryDefinition<T> = {
  kind: 'functionFactory';
  id: string;
  strategy: symbol;
  factory: (...args: any[]) => T;
  dependencies: Array<InstanceEntry<any>>;
};

export type DecoratorDefinition<T> = {
  kind: 'decorator';
  id: string;
  strategy: symbol;
  decorator: (prev: T) => T;
  decorated: InstanceEntry<T>;
};

export type ConstDefinition<T> = {
  kind: 'const';
  id: string;
  strategy: symbol;
  value: T;
};
