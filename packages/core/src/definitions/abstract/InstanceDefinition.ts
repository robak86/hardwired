import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';
import { ContainerContext } from '../../context/ContainerContext';

export type InstanceDefinitionContext = ContainerContext;

export type InstanceDefinition<TInstance, TExternal = []> = {
  id: string;
  strategy: symbol;
  isAsync: false;
  externals: string[];
  create: (context: InstanceDefinitionContext, _?: TExternal) => TInstance; // _ is fake parameter introduced in order to preserve TExternal type
};

export const instanceDefinition = {
  isAsync(val: AnyInstanceDefinition<any, any>): val is AsyncInstanceDefinition<any, any> {
    return (val as any).isAsync;
  },
  isSync(val: AnyInstanceDefinition<any, any>): val is InstanceDefinition<any, any> {
    return !(val as any).isAsync;
  },
};
