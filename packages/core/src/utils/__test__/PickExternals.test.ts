import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../definitions/abstract/InstanceDefinition';
import { PickExternals } from '../PickExternals';

describe(`PickExternals`, () => {
  it(`returns correct type for no externals`, async () => {
    type Combined = PickExternals<
      [InstanceDefinition<any, []>, InstanceDefinition<any, []>, InstanceDefinition<any, []>]
    >;

    expectType<TypeEqual<Combined, []>>(true);
  });

  it(`returns correct type`, async () => {
    type Combined = PickExternals<
      [
        InstanceDefinition<any, [{ item: number }]>,
        InstanceDefinition<any, [{ item: string }]>,
        InstanceDefinition<any, [{ item2: string }]>,
        InstanceDefinition<any, []>,
      ]
    >;
    expectType<TypeEqual<Combined, [{ item: number }, { item: string }, { item2: string }]>>(true);
  });
});
