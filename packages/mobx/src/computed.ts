import { container, InstanceDefinition, SingletonStrategy, value } from 'hardwired';
import { autorun, computed, IComputedValue, observable } from 'mobx';
import { v4 } from 'uuid';

export type ComputedBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: TFunctionArgs) => TValue,
    ...args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> }
  ): InstanceDefinition<IComputedValue<TValue>>;
};

const computedDef: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy: SingletonStrategy.type,
    create: (dependencies: any[]) => {
      return computed(() => {
        return factory(...(dependencies as any));
      });
    },
    dependencies,
    meta: undefined,
  };
};

type User = {
  firstName: string;
  lastName: string;
};

const a = value(observable({ firstName: 'Tomasz', lastName: 'Ro' }));

const sel = (user: User) => {
  return user.firstName;
};

const cmp = computedDef(sel, a);

const cnt = container();

const user = cnt.get(a);
const userComputed = cnt.get(cmp);

autorun(() => {
  console.log(userComputed.get());
});
