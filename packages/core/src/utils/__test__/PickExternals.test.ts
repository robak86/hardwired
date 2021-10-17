import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../definitions/abstract/InstanceDefinition';
import { PickExternals } from '../PickExternals';

describe(`PickExternals`, () => {
  it(`returns correct type for no externals`, async () => {
    type Combined = PickExternals<
      [InstanceDefinition<any, any, []>, InstanceDefinition<any, any, []>, InstanceDefinition<any, any, []>]
    >;

    expectType<TypeEqual<Combined, []>>(true);
  });

  it(`returns correct type`, async () => {
    type Combined = PickExternals<
      [
        InstanceDefinition<any, any, [{ item: number }]>,
        InstanceDefinition<any, any, [{ item: string }]>,
        InstanceDefinition<any, any, [{ item2: string }]>,
        InstanceDefinition<any, any, []>,
      ]
    >;
    expectType<TypeEqual<Combined, [{ item: number }, { item: string }, { item2: string }]>>(true);
  });

  it(`removes duplicates`, async () => {
    type Combined = PickExternals<
      [
        InstanceDefinition<any, any, [{ item: number }]>,
        InstanceDefinition<any, any, [{ item: number }]>,
        InstanceDefinition<any, any, [{ item2: string }]>,
        InstanceDefinition<any, any, []>,
      ]
    >;
    expectType<TypeEqual<Combined, [{ item: number }, { item2: string }]>>(true);
  });
});
