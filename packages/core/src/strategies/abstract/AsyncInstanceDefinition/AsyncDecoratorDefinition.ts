import { InstanceDefinition } from '../InstanceDefinition';

export type AsyncDecoratorDefinition<T, TExternal = never> = {
  type: 'asyncDecorator';
  id: string;
  strategy: symbol;
  dependencies: any[];
  decorator: (prev: T, ...args: any[]) => T;
  decorated: InstanceDefinition<T>;
};
