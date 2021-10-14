import { InstanceDefinitionContext } from './InstanceDefinition';

export type AsyncInstanceDefinition<T, TExternal> = {
  id: string;
  strategy: symbol;
  isAsync: true;
  externals: string[];
  create: (context: InstanceDefinitionContext) => Promise<T>;
};
