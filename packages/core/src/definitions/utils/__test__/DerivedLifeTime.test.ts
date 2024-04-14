import { DerivedLifeTime } from '../DerivedLifeTime.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { expectType, TypeOf } from 'ts-expect';

describe(`DerivedLifeTime`, () => {
  it(`returns transient if the lifetime is an union of multiple types`, async () => {
    type Subject = DerivedLifeTime<LifeTime.singleton | LifeTime.scoped>;
    expectType<TypeOf<Subject, LifeTime.transient>>(true);
  });

  it(`returns a single type if the lifetime is not an union`, async () => {
    type Subject1 = DerivedLifeTime<LifeTime.singleton>;
    expectType<TypeOf<Subject1, LifeTime.singleton>>(true);

    type Subject2 = DerivedLifeTime<LifeTime.scoped>;
    expectType<TypeOf<Subject2, LifeTime.scoped>>(true);

    type Subject3 = DerivedLifeTime<LifeTime.transient>;
    expectType<TypeOf<Subject3, LifeTime.transient>>(true);
  });
});
