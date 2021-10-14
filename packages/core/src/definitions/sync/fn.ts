import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';

export type FunctionDefinitionBuildFn = {
  <
    TValue,
    TFunctionArgs extends any[],
    TDeps extends { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K], any> },
  >(
    factory: (...args: TFunctionArgs) => TValue,
    ...args: TDeps
  ): InstanceDefinition<TValue, PickExternals<TDeps>>;
};

export const fn = (strategy: symbol): FunctionDefinitionBuildFn => {
  return (factory, ...dependencies) => ({
    id: `${factory.name}:${v4()}`,
    isAsync: false,
    strategy,
    externals: pickExternals(dependencies),
    create: context => {
      return factory(...(dependencies.map(context.buildWithStrategy) as any));
    },
  });
};
