import { expectType, TypeEqual, TypeOf } from 'ts-expect';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';
import { PickExternals } from '../PickExternals.js';
import { WithExternals } from '../../definitions/abstract/base/BaseDefinition.js';
import { describe, it, expect, vi } from 'vitest';

describe(`PickExternals`, () => {
  it(`returns correct type for no externals`, async () => {
    type Combined = PickExternals<
      [InstanceDefinition<any, any, never>, InstanceDefinition<any, any, never>, InstanceDefinition<any, any, never>]
    >;

    expectType<TypeEqual<Combined, never>>(true);
  });

  it(`returns correct type for empty externals tuple`, async () => {
    type Combined = PickExternals<[]>;
    expectType<TypeEqual<Combined, never>>(true);
  });

  it(`returns correct type ex.1`, async () => {
    type Combined = PickExternals<[WithExternals<{ b: 1 }>, WithExternals<never>]>;
    expectType<TypeEqual<Combined, { b: 1 }>>(true);
  });

  it(`returns correct type ex.2`, async () => {
    type Combined = PickExternals<[PickExternals<[WithExternals<never>, WithExternals<never>]>]>;
    expectType<TypeEqual<Combined, never>>(true);
  });

  it(`returns correct type`, async () => {
    type Combined = PickExternals<
      [
        InstanceDefinition<any, any, { item1: number }>,
        InstanceDefinition<any, any, { item2: string }>,
        InstanceDefinition<any, any, { item3: boolean }>,
        InstanceDefinition<any, any, never>,
        WithExternals<never>,
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
