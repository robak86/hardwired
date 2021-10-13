import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { PickExternals } from '../../utils/PickExternals';

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
    externalsIds: dependencies.flatMap(def => def.externalsIds), // TODO: externalIds shouldn't have duplicates
    create: build => {
      return factory(...(dependencies.map(build) as any));
    },
  });
};
