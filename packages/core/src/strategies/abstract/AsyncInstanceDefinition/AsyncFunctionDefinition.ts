import { v4 } from 'uuid';
import { AnyInstanceDefinition } from "../AnyInstanceDefinition";

export type AsyncFunctionFactoryDefinition<T, TMeta = never, TExternal = never> = {
  type: 'asyncFunction';
  id: string;
  strategy: symbol;
  factory: (...args: any[]) => T;
  dependencies: Array<AnyInstanceDefinition<any>>;
};

export const asyncFunctionDefinition = <T, TDeps extends any[]>(
  factory: (...args: TDeps) => Promise<T>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: AnyInstanceDefinition<TDeps[K]> },
): AsyncFunctionFactoryDefinition<T> => {
  return {
    type: 'asyncFunction',
    id: `${factory.name}:${v4()}`,
    strategy,
    factory: factory as any,
    dependencies,
  };
};
