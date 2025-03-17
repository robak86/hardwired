import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';
import { describe, it } from 'vitest';

import { value } from '../value.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import { fn } from '../fn.js';
import type { Definition } from '../impl/Definition.js';

describe(`klass`, () => {
  describe(`external params`, () => {
    class TestClass {
      constructor(
        // @ts-ignore
        private num: number,
        // @ts-ignore
        private ext: string,
      ) {}
    }

    describe(`types`, () => {
      it(`correctly picks external params from instances definitions provided as dependencies ex.1`, async () => {
        const numD = value(123);
        const objD = value('123');

        const cls = fn.scoped(use => {
          return new TestClass(use(numD), use(objD));
        });

        expectType<TypeEqual<typeof cls, Definition<TestClass, LifeTime.scoped, []>>>(true);
      });
    });
  });
});
