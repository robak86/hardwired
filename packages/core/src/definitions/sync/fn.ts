import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';

export type FunctionDefinitionBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: TFunctionArgs) => TValue,
    ...args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> }
  ): InstanceDefinition<TValue>;
};

export const fn = (strategy: symbol): FunctionDefinitionBuildFn => {
  return (factory, ...args) => ({
    id: `${factory.name}:${v4()}`,
    strategy,
    create: build => {
      return factory(...(args.map(build) as any));
    },
    meta: undefined,
  });
};

