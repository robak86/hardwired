import { InstanceDefinition, SingletonStrategy } from 'hardwired';
import { computed, IObservableValue } from 'mobx';
import { v4 } from 'uuid';
import 'source-map-support/register';

export type ComputedBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    selectFn: (...args: TFunctionArgs) => TValue,
    ...args: [...{ [K in keyof TFunctionArgs]: InstanceDefinition<IObservableValue<TFunctionArgs[K]>> }]
  ): InstanceDefinition<IObservableValue<TValue>>;
};

export const selector: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy: SingletonStrategy.type,
    create: (dependencies: any[]) => {
      return computed(() => {
        const deps = dependencies.map(d => d.get() as any) as any;
        return factory(...deps);
      });
    },
    dependencies,
    meta: undefined,
  };
};

type MyState = {
  user: User;
  address: Address;
};

type Address = {
  streetName: string;
};

type User = {
  firstName: string;
  lastName: string;
};

// const state = observable({
//   user: { firstName: 'Tomasz', lastName: 'Ro' },
//   address: { streetName: 'someStreetName' },
// });
//
// const nameSel = (state: MyState) => state.user.firstName;
// const nameSelDef = selector(nameSel, state);
//
// const streetSel = (state: MyState) => state.address.streetName;
// const streetSelDef = selector(streetSel, state);
//
// const sel = (address: string, userName: string) => {
//   return `${address}:${userName}`;
// };
//
// const cmp = selector(sel, streetSelDef, nameSelDef);
// const cnt = container();
//
// const stateInstance = cnt.get(state);
// const userComputed = cnt.get(cmp);
//
// autorun(() => {
//   console.log(userComputed.get());
// });
//
// stateInstance.get().user = { firstName: 'newFirstName2', lastName: 'newLastName' };
// stateInstance.set({
//   user: { firstName: 'newFirstName2', lastName: 'newLastName' },
//   address: { streetName: 'someStreetName' },
// });
