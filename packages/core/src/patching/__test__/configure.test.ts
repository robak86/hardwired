import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { scoped, singleton } from '../../definitions/tokens.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';

describe(`configure`, () => {
  describe(`scoped with default impl with configureContainer`, () => {
    const someValue = scoped.fn(() => new BoxedValue(1));
    const someValueAsync = scoped.fn(async () => new BoxedValue(1));

    it(`it's applicative`, async () => {
      const config1 = configureContainer(c => {
        c.modify(someValue).configure(val => {
          val.value = 10;
        });
      });

      const config2 = configureContainer(c => {
        c.modify(someValue).configure(val => {
          val.value = 20;
        });
      });

      const c = container(config1, config2);

      expect(c.use(someValue).value).toEqual(20);
    });

    it(`is inherited by child scope`, async () => {
      const config1 = configureContainer(c => {
        c.modify(someValue).configure(val => {
          val.value = 20;
        });
      });

      const c = container(config1);

      expect(c.use(someValue).value).toEqual(20);
      expect(c.scope().use(someValue).value).toEqual(20); // this fails
    });

    it(`is applicative across scopes`, async () => {
      const cnt = container(c => {
        c.modify(someValue).configure(val => {
          val.value += 10; // 1 + 10 = 11
        });
      });

      const child = cnt.scope(c => {
        c.modify(someValue).configure(val => {
          val.value += 5; // 11 + 5 = 16
        });
      });

      const child2 = child.scope(c => {
        c.modify(someValue).configure(val => {
          val.value += 100; // 16 + 100 = 116
        });
      });

      expect(cnt.use(someValue).value).toEqual(11);
      expect(child.use(someValue).value).toEqual(16);
      expect(child2.use(someValue).value).toEqual(116);
    });

    it(`is evaluated with awaited value`, async () => {
      const config = configureContainer(c => {
        c.modify(someValueAsync).configure(val => {
          val.value = 10;
        });
      });
      const c = container(config);

      expect((await c.use(someValueAsync)).value).toEqual(10);
    });

    it(`allows using additional dependencies, ex1`, async () => {
      const a = singleton.token<BoxedValue<number>>();
      const b = singleton.token<BoxedValue<number>>();
      const someValue = singleton.token<BoxedValue<number>>();

      const config = configureContainer(c => {
        c.add(a).fn(() => new BoxedValue(1));
        c.add(b).static(new BoxedValue(2));
        c.add(someValue).fn(() => new BoxedValue(10));

        c.modify(someValue)
          .using(a, b)
          .configure((val, aVal, bVal) => {
            val.value = val.value + aVal.value + bVal.value;
          });
      });

      const c = container(config);

      expect(c.use(someValue).value).toEqual(13);
    });
  });

  describe(`scoped with default impl`, () => {
    const someValue = scoped.fn(() => new BoxedValue(1));
    const someValueAsync = scoped.fn(async () => new BoxedValue(1));

    it(`decorates original value`, async () => {
      const c = container(c => {
        c.modify(someValue).configure(val => {
          val.value = 10;
        });
      });

      expect(c.use(someValue).value).toEqual(10);
    });

    it(`is evaluated with awaited value`, async () => {
      const c = container(c => {
        c.modify(someValueAsync).configure(val => {
          val.value = 10;
        });
      });

      expect((await c.use(someValueAsync)).value).toEqual(10);
    });

    it(`allows using additional dependencies, ex1`, async () => {
      const a = singleton.token<BoxedValue<number>>();
      const b = singleton.token<BoxedValue<number>>();
      const someValue = singleton.token<BoxedValue<number>>();

      const c = container(c => {
        c.add(a).fn(() => new BoxedValue(1));
        c.add(b).static(new BoxedValue(2));
        c.add(someValue).fn(() => new BoxedValue(10));

        c.modify(someValue)
          .using(a, b)
          .configure((val, aVal, bVal) => {
            val.value = val.value + aVal.value + bVal.value;
          });
      });

      expect(c.use(someValue).value).toEqual(13);
    });
  });

  describe(`scoped`, () => {
    const someValue = scoped.token<BoxedValue<number>>('someValue');
    const someValueAsync = scoped.token<Promise<BoxedValue<number>>>('someValue');

    it(`decorates original value`, async () => {
      const c = container(c => {
        c.add(someValue).static(new BoxedValue(1));
        c.modify(someValue).configure(val => {
          val.value = 10;
        });
      });

      expect(c.use(someValue).value).toEqual(10);
    });

    it(`is evaluated with awaited value`, async () => {
      const c = container(c => {
        c.add(someValueAsync).fn(async () => new BoxedValue(1));
        c.modify(someValueAsync).configure(val => {
          val.value = 10;
        });
      });

      expect((await c.use(someValueAsync)).value).toEqual(10);
    });

    it(`allows using additional dependencies, ex1`, async () => {
      const a = singleton.token<BoxedValue<number>>();
      const b = singleton.token<BoxedValue<number>>();
      const someValue = singleton.token<BoxedValue<number>>();

      const c = container(c => {
        c.add(a).fn(() => new BoxedValue(1));
        c.add(b).static(new BoxedValue(2));
        c.add(someValue).fn(() => new BoxedValue(10));

        c.modify(someValue)
          .using(a, b)
          .configure((val, aVal, bVal) => {
            val.value = val.value + aVal.value + bVal.value;
          });
      });

      expect(c.use(someValue).value).toEqual(13);
    });
  });

  describe(`singletons`, () => {
    const someValue = singleton.token<BoxedValue<number>>('someValue');
    const someValueAsync = singleton.token<Promise<BoxedValue<number>>>('someValue');

    it(`decorates original value`, async () => {
      const c = container(c => {
        c.add(someValue).static(new BoxedValue(1));
        c.modify(someValue).configure(val => {
          val.value = 10;
        });
      });

      expect(c.use(someValue).value).toEqual(10);
    });

    it(`is evaluated with awaited value`, async () => {
      const c = container(c => {
        c.add(someValueAsync).fn(async () => new BoxedValue(1));
        c.modify(someValueAsync).configure(val => {
          val.value = 10;
        });
      });

      expect((await c.use(someValueAsync)).value).toEqual(10);
    });

    it(`allows using additional dependencies, ex1`, async () => {
      const a = singleton.token<BoxedValue<number>>();
      const b = singleton.token<BoxedValue<number>>();
      const someValue = singleton.token<BoxedValue<number>>();

      const c = container(c => {
        c.add(a).fn(() => new BoxedValue(1));
        c.add(b).static(new BoxedValue(2));
        c.add(someValue).fn(() => new BoxedValue(10));

        c.modify(someValue)
          .using(a, b)
          .configure((val, aVal, bVal) => {
            val.value = val.value + aVal.value + bVal.value;
          });
      });

      expect(c.use(someValue).value).toEqual(13);
    });
  });
});
