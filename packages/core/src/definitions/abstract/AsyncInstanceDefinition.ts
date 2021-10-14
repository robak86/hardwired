import { InstanceDefinition, InstanceDefinitionContext } from './InstanceDefinition';

export type AsyncInstanceDefinition<T, TExternals> = {
  id: string;
  strategy: symbol;
  isAsync: true;
  externals: Array<InstanceDefinition<any, any>>;
  create: (context: InstanceDefinitionContext) => Promise<T>;
};
