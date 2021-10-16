import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime} from '../abstract/LifeTime';
import { Resolution } from "../abstract/Resolution";

export type FunctionDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TValue,
    TFunctionArgs extends any[],
    TDeps extends { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K], any, any> },
  >(
    factory: (...args: TFunctionArgs) => TValue,
    ...args: TDeps
  ): InstanceDefinition<TValue, TLifeTime, PickExternals<TDeps>>;
};

export const fn = <TLifeTime extends LifeTime>(strategy: TLifeTime): FunctionDefinitionBuildFn<TLifeTime> => {
  return (factory, ...dependencies) => ({
    id: `${factory.name}:${v4()}`,
    resolution: Resolution.sync,
    strategy,
    externals: pickExternals(dependencies),
    create: context => {
      return factory(...(dependencies.map(context.buildWithStrategy) as any));
    },
  });
};
