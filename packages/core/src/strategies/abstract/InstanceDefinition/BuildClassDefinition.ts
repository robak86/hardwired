import { ClassType } from '../../../utils/ClassType';
import { InstanceDefinition } from '../InstanceDefinition';
import { v4 } from 'uuid';

export type ClassDefinition<T, TMeta = never, TExternal = never> = {
  type: 'class';
  id: string;
  strategy: symbol;
  class: ClassType<T, any>;
  dependencies: Array<InstanceDefinition<any>>;
  meta: TMeta;
};

export const buildClassDefinition = <T, TDeps extends any[], TMeta>(
  klass: ClassType<T, TDeps>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
  meta?: TMeta,
): ClassDefinition<T, TMeta> => {
  return {
    type: 'class',
    id: v4(),
    strategy,
    class: klass,
    dependencies,
    meta: meta as any,
  };
};
