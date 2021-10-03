import { InstanceDefinition } from '../InstanceDefinition';
import { v4 } from 'uuid';

export type AsyncFunctionFactoryDefinition<T, TMeta = never, TExternal = never> = {
  type: 'asyncFunction';
  id: string;
  strategy: symbol;
  factory: (...args: any[]) => T;
  dependencies: Array<InstanceDefinition<any>>;
};

export const functionDefinition = <T, TDeps extends any[]>(
  factory: (...args: TDeps) => Promise<T>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
): AsyncFunctionFactoryDefinition<T> => {
  return {
    type: 'asyncFunction',
    id: `${factory.name}:${v4()}`,
    strategy,
    factory: factory as any,
    dependencies,
  };
};
