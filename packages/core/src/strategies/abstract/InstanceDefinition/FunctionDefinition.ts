import { InstanceDefinition } from '../InstanceDefinition';
import { v4 } from 'uuid';

export type FunctionFactoryDefinition<T, TMeta = never, TExternal = never> = {
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
