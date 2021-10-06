import { container, InstanceDefinition, SingletonStrategy } from 'hardwired';
import { autorun, IObservableValue } from 'mobx';
import { v4 } from 'uuid';
import 'source-map-support/register';
import { state } from './state';
import { createTransformer } from 'mobx-utils';
import { selector } from './selector';
import { action } from './action';

export type ComputedBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[], TParams extends string | number>(
    factory: (...args: [...TFunctionArgs, TParams]) => TValue,
    ...args: [...{ [K in keyof TFunctionArgs]: InstanceDefinition<IObservableValue<TFunctionArgs[K]>> }]
  ): InstanceDefinition<IObservableValue<(params: TParams) => TValue>>;
};

export const parametrizedSelector: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy: SingletonStrategy.type,
    create: (dependencies: any[]) => {
      const transformer = createTransformer((params: any) => {
        const deps = dependencies.map(d => d.get() as any) as any;
        deps.push(params);
        return factory(...deps);
      });

      return { get: () => transformer };
    },
    dependencies,
    meta: undefined,
  };
};

type MyState = {
  users: Record<string, User>;
  address: Address;
};

type Address = {
  streetName: string;
};

type User = {
  firstName: string;
  lastName: string;
};

const stateD = state({
  users: {
    '1': { firstName: 'Tomasz', lastName: 'Ro' },
    '2': { firstName: 'John', lastName: 'Doe' },
  },
  address: { streetName: 'someStreetName' },
});

const nameSel = (state: MyState, userId: string) => state.users[userId].firstName;
const nameSelDef = parametrizedSelector(nameSel, stateD);

const streetSel = (state: MyState) => state.address.streetName;
const streetSelDef = selector(streetSel, stateD);

const sel = (address: string, userName: (userId: string) => string) => `${address}:${userName('2')}`;

const updateName = (state: MyState) => (state.users[2].firstName = 'newName');
const updateNameParametrized = (newName: string, state: MyState) => (state.users[2].firstName = newName);

const updateStateAction = action(updateName, stateD);
const updateStateAction2 = action(updateNameParametrized, stateD);

const cmp = selector(sel, streetSelDef, nameSelDef);
const cnt = container();

const stateInstance = cnt.get(stateD);
const userComputed = cnt.get(cmp);
const updateAction = cnt.get(updateStateAction);
const updateAction2 = cnt.get(updateStateAction2);

autorun(() => {
  console.log(userComputed.get());
});

updateAction();
updateAction2('new name2');
//
// runInAction(() => {
//   stateInstance.get().users[1] = { firstName: 'newFirstName2', lastName: 'newLastName' };
//   stateInstance.set({
//     users: {
//       1: { firstName: 'newFirstName3', lastName: 'newLastName' },
//       2: { firstName: 'newFirstName3', lastName: 'newLastName' },
//     },
//     address: { streetName: 'someStreetName' },
//   });
// });
