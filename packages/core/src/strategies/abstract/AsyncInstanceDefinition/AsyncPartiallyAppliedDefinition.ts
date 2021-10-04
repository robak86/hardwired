import { InstanceDefinition } from '../InstanceDefinition';
import { v4 } from 'uuid';

export type AsyncPartiallyAppliedDefinition<T, TExternal = never> = {
  type: 'asyncPartiallyApplied';
  id: string;
  strategy: symbol;
  fn: T;
  dependencies: Array<InstanceDefinition<any>>;
  meta: any;
};

export const buildAsyncPartiallyAppliedFnDefinition = <TMeta>(
  strategy: symbol,
  fn,
  dependencies,
  meta: TMeta,
): AsyncPartiallyAppliedDefinition<any, never> => {
  return {
    type: 'asyncPartiallyApplied',
    id: `${fn.name}:${v4()}`,
    strategy,
    fn,
    dependencies,
    meta,
  };
};
