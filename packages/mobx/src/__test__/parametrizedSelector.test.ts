import { state } from '../state';
import { parametrizedView } from '../parametrizedView';
import { container } from 'hardwired';
import { autorun, runInAction } from 'mobx';

describe(`parametrizedSelector`, () => {
  type User = {
    firstName: string;
    lastName: string;
    addressId: string;
  };

  type Address = {
    streetName: string;
  };

  type State = {
    users: Record<number, User>;
    addresses: Record<number, Address>;
  };

  it(`returns correct value`, async () => {
    const stateD = state({
      users: {
        1: { firstName: 'firstName1', lastName: 'lastName1', addressId: '1' },
        2: { firstName: 'firstName2', lastName: 'lastName2', addressId: '2' },
      },
      addresses: {},
    });

    const selectNameByUserId = (state: State, userId: number) => {
      return `${state.users[userId].firstName}:${state.users[userId].lastName}`;
    };

    const selectNameForUserD = parametrizedView(selectNameByUserId, stateD);

    const ctn = container();
    const selectInstance = ctn.get(selectNameForUserD);
    const name1 = selectInstance(1);
    expect(name1).toEqual('firstName1:lastName1');
  });

  it(`memorizes value`, async () => {
    const stateD = state({
      users: {
        1: { firstName: 'firstName1', lastName: 'lastName1', addressId: '1' },
        2: { firstName: 'firstName2', lastName: 'lastName2', addressId: '2' },
      },
      addresses: {},
    });

    const selectNameByUserId = jest.fn((state: State, userId: number) => {
      return `${state.users[userId].firstName}:${state.users[userId].lastName}`;
    });

    const selectNameForUserD = parametrizedView(selectNameByUserId, stateD);

    const ctn = container();
    const [selectInstance, stateInstance] = ctn.getAll(selectNameForUserD, stateD);
    autorun(() => {
      selectInstance(1);
    });

    expect(selectNameByUserId).toHaveBeenCalledTimes(1);
    runInAction(() => {
      stateInstance.get().users['2'].firstName = 'newName';
    });
    expect(selectNameByUserId).toHaveBeenCalledTimes(1);
  });

  it(`allows composing multiple transformers`, async () => {
    const stateD = state({
      users: {
        1: { firstName: 'firstName1', lastName: 'lastName1', addressId: '1' },
        2: { firstName: 'firstName2', lastName: 'lastName2', addressId: '2' },
      },
      addresses: {
        1: {
          streetName: 'street1',
        },
        2: {
          streetName: 'street2',
        },
      },
    });

    let count = 0;
    const selectAddressByUserId = (state: State, selectUser: (userId: number) => User, userId: number): Address => {
      count += 1;
      const user = selectUser(userId);
      return state.addresses[user.addressId];
    };

    const selectUserId = (state: State, userId: number) => state.users[userId];

    const selectUserByIdD = parametrizedView(selectUserId, stateD);
    const selectAddressForUserIdD = parametrizedView(selectAddressByUserId, stateD, selectUserByIdD);

    const ctn = container();
    const [selectInstance, stateInstance] = ctn.getAll(selectAddressForUserIdD, stateD);
    autorun(() => selectInstance(1));

    expect(count).toEqual(1);

    runInAction(() => (stateInstance.get().users['1'].firstName = 'newName'));
    expect(count).toEqual(1);

    runInAction(() => (stateInstance.get().users['1'].addressId = '2'));
    expect(count).toEqual(2);
  });
});
