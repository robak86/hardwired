import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';

export type InstanceDefinition<TInstance, TExternal = void> = {
  id: string;
  strategy: symbol;
  isAsync: false;
  externalsIds: string[];
  create: (buildFn: InstanceBuildFn, _?:TExternal) => TInstance; // _ is fake parameter introduced in order to preserve TExternal type
};

export type InstanceBuildFn = {
  (definition: InstanceDefinition<any>): any;
};

export type InstanceAsyncBuildFn = {
  (definition: AnyInstanceDefinition<any>): Promise<any>;
};

export const instanceDefinition = {
  isAsync(val: AnyInstanceDefinition<any, any>): val is AsyncInstanceDefinition<any, any> {
    return (val as any).isAsync;
  },
  isSync(val: AnyInstanceDefinition<any, any>): val is InstanceDefinition<any, any> {
    return !(val as any).isAsync;
  },
};
