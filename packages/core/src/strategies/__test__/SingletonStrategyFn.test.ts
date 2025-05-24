import { v4 } from 'uuid';
import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { singleton } from '../../definitions/def-symbol.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';

describe(`SingletonStrategy`, () => {
  describe(`sync resolution`, () => {
    const someValueD = singleton<string>();
    const leafD = singleton<{ value: string; id: string }>();
    const consumerD = singleton<{ testClassInstance: { value: string; id: string } }>();

    const setup = configureContainer(c => {
      c.add(someValueD).fn(() => 'someString');
      c.add(leafD).fn(someValue => {
        return {
          value: someValue,
          id: v4(),
        };
      }, someValueD);
      c.add(consumerD).fn(leaf => {
        return { testClassInstance: leaf };
      }, leafD);
    });

    describe(`resolution`, () => {
      describe(`single module`, () => {
        it(`returns class instance`, async () => {
          const c = container.new(setup);

          expect(c.use(leafD).trySync()).toHaveProperty('value');
          expect(c.use(leafD).trySync()).toHaveProperty('id');
        });

        it(`constructs class with correct dependencies`, async () => {
          const c = container.new(setup);
          const instance = await c.use(leafD);

          expect(instance.value).toEqual('someString');
        });

        it(`caches class instance`, async () => {
          const c = container.new(setup);
          const instance = await c.use(leafD);
          const instance2 = await c.use(leafD);

          expect(instance).toBe(instance2);
        });
      });
    });
  });

  describe(`async resolution`, () => {
    const resolveAfter = <T>(timeout: number, value: T): Promise<T> => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(value);
        }, timeout);
      });
    };

    describe.skip(`class`, () => {
      describe(`no dependencies`, () => {});

      describe(`dependencies`, () => {});
    });

    describe(`fn`, () => {
      describe(`no dependencies`, () => {
        it(`returns correct value`, async () => {});
      });

      describe(`race condition`, () => {
        it(`does not create singleton duplicates`, async () => {
          const slowSingletonD = singleton<BoxedValue<number>>();
          const consumer1 = singleton<BoxedValue<number>>();
          const consumer2 = singleton<BoxedValue<number>>();

          const ctn = container.new(c => {
            c.add(slowSingletonD).fn(() => resolveAfter(Math.random() * 500, new BoxedValue(Math.random())));
            c.add(consumer1).fn(async value => value, slowSingletonD);
            c.add(consumer2).fn(async value => value, slowSingletonD);
          });

          const [result1, result2] = await Promise.all([ctn.use(consumer1), ctn.use(consumer2)]);

          expect(result1).toBe(result2);
        });
      });
    });
  });
});
