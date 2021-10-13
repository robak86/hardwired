import { InstanceDefinitionContext } from './InstanceDefinition';

export type AsyncInstanceDefinition<T, TExternal> = {
  id: string;
  strategy: symbol;
  isAsync: true;
  create: (context: InstanceDefinitionContext) => Promise<T>;
};
