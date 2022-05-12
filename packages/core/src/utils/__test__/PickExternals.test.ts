import { expectType, TypeEqual, TypeOf } from 'ts-expect';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition';
import { PickExternals } from '../PickExternals';
import { WithExternals } from '../../definitions/abstract/base/BaseDefinition';

describe(`PickExternals`, () => {
  it(`returns correct type for no externals`, async () => {
    type Combined = PickExternals<
      [InstanceDefinition<any, any, never>, InstanceDefinition<any, any, never>, InstanceDefinition<any, any, never>]
    >;

    expectType<TypeEqual<Combined, never>>(true);
  });

  it(`returns correct type`, async () => {
    type Combined = PickExternals<
      [
        InstanceDefinition<any, any, { item1: number }>,
        InstanceDefinition<any, any, { item2: string }>,
        InstanceDefinition<any, any, { item3: boolean }>,
        InstanceDefinition<any, any, never>,
        // WithExternals< never>,
      ]
    >;
    expectType<
      TypeOf<
        Combined,
        {
          item1: number;
          item2: string;
          item3: boolean;
        }
      >
    >(true);
  });

  it(`removes duplicates`, async () => {
    type Combined = PickExternals<
      [
        InstanceDefinition<any, any, { item1: number }>,
        InstanceDefinition<any, any, { item1: string }>,
        InstanceDefinition<any, any, { item2: boolean }>,
        InstanceDefinition<any, any, never>,
      ]
    >;
    expectType<
      TypeOf<
        Combined,
        {
          item1: number;
          item2: boolean;
        } & { item1: string }
      >
    >(true);
  });
});
