import { expectType, TypeEqual } from "ts-expect";
import { PropType } from "../PropType";

describe(`PropType`, () => {
  it(`returns type for given path`, async () => {
    type Obj = {
      a: {
        b: {
          c: number;
        };
      };
      d: string;
    };

    expectType<TypeEqual<PropType<Obj, 'a.b.c'>, number>>(true);
    expectType<TypeEqual<PropType<Obj, 'd'>, string>>(true);
  });
});
