import { expectType, TypeEqual } from 'ts-expect';
import { PropType } from '../PropType';
import { ObjectPaths } from '../ObjectPaths';

describe(`ObjectPaths`, () => {
  it(`returns union of all paths available for given object`, async () => {
    type Obj = {
      a: {
        b: {
          c: number;
        };
      };
      d: string;
    };

    expectType<TypeEqual<ObjectPaths<Obj>, 'd' | 'a.b.c'>>(true);
  });
});
