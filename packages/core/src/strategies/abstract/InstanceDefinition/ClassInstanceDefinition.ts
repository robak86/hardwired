import { ClassType } from '../../../utils/ClassType';
import { InstanceDefinition } from '../InstanceDefinition';
import { v4 } from 'uuid';

export type ClassInstanceDefinition<T, TMeta = never, TExternal = never> = {
  type: 'class';
  id: string;
  strategy: symbol;
  class: ClassType<T, any>;
  dependencies: Array<InstanceDefinition<any>>;
};

// TODO: should be exported as it allows creating custom strategies
export const classDefinition = <T, TDeps extends any[]>(
  klass: ClassType<T, TDeps>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
): ClassInstanceDefinition<T> => {
  return {
    type: 'class',
    id: v4(),
    strategy,
    class: klass,
    dependencies,
  };
};
