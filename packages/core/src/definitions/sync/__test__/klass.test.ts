import type { TypeEqual } from 'ts-expect';
import { expectType } from 'ts-expect';
import { describe, expect, it } from 'vitest';

import { value } from '../value.js';
import type { LifeTime } from '../../abstract/LifeTime.js';
import { fn } from '../../definitions.js';
import { unbound } from '../unbound.js';
import type { Definition } from '../../abstract/Definition.js';

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

      describe(`allowed dependencies life times`, () => {
        class NumberConsumer {
          // @ts-ignore
          constructor(private value: number) {}
        }

        const implDef = unbound<number>();

        describe(`singleton`, () => {
          describe(`compile-time`, () => {
            it(`does not accept unbound definitions`, async () => {
              try {
                // @ts-expect-error singleton does not accept unbound definitions
                const dep = singleton.using(implDef).class(NumberConsumer);
              } catch (e) {
                // noop
              }
            });
          });

          describe(`runtime`, () => {
            it.skip(`does not accept unbound definitions`, async () => {
              const buildDef = () => {
                // @ts-expect-error singleton does not accept unbound definitions
                singleton.using(implDef).class(NumberConsumer);
              };

              expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
            });
          });
        });
      });
    });
  });
});
