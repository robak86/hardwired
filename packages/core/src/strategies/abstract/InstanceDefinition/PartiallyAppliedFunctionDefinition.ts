import { InstanceDefinition } from '../InstanceDefinition';
import { v4 } from 'uuid';

export type PartiallyAppliedFunctionDefinition<T, TMeta = never, TExternal = never> = {
  type: 'partiallyApplied';
  id: string;
  strategy: symbol;
  fn: T extends (...args:any[]) => T ? T : never;
  dependencies: Array<InstanceDefinition<any>>;
  meta: TMeta;
};

export const partiallyAppliedFnDefinition = <TMeta>(
  strategy: symbol,
  fn,
  dependencies,
  meta: TMeta,
): PartiallyAppliedFunctionDefinition<any, TMeta, never> => {
  return {
    type: 'partiallyApplied',
    id: `${fn.name}:${v4()}`,
    strategy,
    fn,
    dependencies,
    meta,
  };
};
