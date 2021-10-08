import { InstanceAsyncBuildFn } from './InstanceDefinition';

export type AsyncInstanceDefinition<T, TExternal> = {
  id: string;
  strategy: symbol;
  isAsync: true;
  create: (build: InstanceAsyncBuildFn) => Promise<T> | T;
};
