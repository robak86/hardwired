import { ClassType } from '../../../utils/ClassType';
import { InstanceDefinition } from '../InstanceDefinition';
import { v4 } from 'uuid';

export type AsyncClassDefinition<T, TExternal = never> = {
  type: 'asyncClass';
  id: string;
  strategy: symbol;
  class: ClassType<T, any>;
  dependencies: Array<InstanceDefinition<any>>;
};

export const buildAsyncClassDefinition = <T, TDeps extends any[]>(
  klass: ClassType<T, TDeps>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
): AsyncClassDefinition<T> => {
  return {
    type: 'asyncClass',
    id: v4(),
    strategy,
    class: klass,
    dependencies,
  };
};
