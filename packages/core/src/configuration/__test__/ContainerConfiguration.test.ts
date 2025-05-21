import type { TypeOf } from 'ts-expect';
import { expectType } from 'ts-expect';
import { describe } from 'vitest';

import type { Container } from '../../container/Container.js';
import { container } from '../../container/Container.js';
import type { IContainer } from '../../container/IContainer.js';
import type { BoxedValue } from '../../__test__/BoxedValue.js';
import { cascading, scoped, singleton } from '../../definitions/def-symbol.js';

describe(`ContainerConfiguration`, () => {
  describe(`modify`, () => {
    describe(`cascading`, () => {
      describe(`decorate`, () => {
        it(`modify is applicative`, async () => {
          const def = cascading<number>('testCascadingDef');

          const cnt = container.new(c => {
            c.add(def).static(0);

            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          const child = cnt.scope(c => {
            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 10);
          });

          const child2 = child.scope(c => {
            c.modify(def).cascade();
          });

          const child3 = child2.scope(c => {
            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          expect(await cnt.use(def)).toEqual(2);
          expect(await child.use(def)).toEqual(11);
          expect(await child3.use(def)).toEqual(2);
        });

        it(`throws when definition wasn't registered`, async () => {
          const def = cascading<number>('testCascadingDef');

          expect(() => {
            container.new(c => {
              c.modify(def).decorate(val => val + 1);
            });
          }).toThrow('No definition registered');
        });
      });
    });

    describe(`scoped`, () => {
      describe(`decorate`, () => {
        it(`modify is applicative`, async () => {
          const def = scoped<number>('testCascadingDef');

          const cnt = container.new(c => {
            c.add(def).static(0);

            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          const child = cnt.scope(c => {
            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 10);
          });

          const child2 = child.scope(c => {
            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          expect(await cnt.use(def)).toEqual(2);
          expect(await child.use(def)).toEqual(11);
          expect(await child2.use(def)).toEqual(2);
        });

        it(`throws when definition wasn't registered`, async () => {
          const def = scoped<number>('testCascadingDef');

          expect(() => {
            container.new(c => {
              c.modify(def).decorate(val => val + 1);
            });
          }).toThrow('No definition registered');
        });
      });
    });

    describe(`singleton`, () => {
      describe(`decorate`, () => {
        it(`modify is applicative`, async () => {
          const def = singleton<number>('testCascadingDef');

          const cnt = container.new(c => {
            c.add(def).static(0);

            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          expect(await cnt.use(def)).toEqual(2);
        });

        it(`throws when definition wasn't registered`, async () => {
          const def = singleton<number>('testCascadingDef');

          expect(() => {
            container.new(c => {
              c.modify(def).decorate(val => val + 1);
            });
          }).toThrow('Cannot override');
        });
      });
    });
  });

  describe(`container#freeze`, () => {
    it(`allows freezing instances before they are created`, async () => {
      // const def = fn.scoped(() => 123);

      const def = scoped<number>();
      const cnt = container.new();

      cnt.freeze(def).static(456);
      expect(cnt.use(def)).toEqual(456);
    });

    it(`throws if the instances is already created`, async () => {
      const def = scoped<number>();

      const cnt = container.new(c => {
        c.add(def).static(123);
      });

      await cnt.use(def);

      expect(() => cnt.freeze(def).static(456)).toThrowError('already instantiated');
    });

    it(`works with child scopes`, async () => {
      const def = scoped<number>();

      const cnt = container.new(c => {
        c.add(def).static(123);
      });

      const scope = cnt.scope();

      scope.freeze(def).static(456);
      expect(scope.use(def)).toEqual(456);
    });

    it(`throws when cascading definition was created in child scope`, async () => {
      const def = cascading<number>();

      const cnt = container.new(c => {
        c.add(def).static(123);
      });

      const scope1 = cnt.scope(s => s.modify(def).cascade());

      await scope1.use(def);

      const scope2 = scope1.scope();

      expect(() => scope2.freeze(def).static(456)).toThrowError('already instantiated');
    });
  });

  describe(`container.new`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new(
        async _c => {},
        _c => {},
      );

      expectType<TypeOf<typeof cnt, Promise<Container>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new(_c => {});

      expectType<TypeOf<typeof cnt, Container>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container.new();

      expectType<TypeOf<typeof cnt, Container>>(true);
    });

    it(`accepts multiple config functions`, async () => {
      const def1 = scoped<number>();
      const def2 = scoped<number>();

      const cnt = await container.new(
        async container => {
          container.add(def1).static(456);
        },
        async container => {
          container.add(def2).static(789);
        },
      );

      expect(cnt.use(def1)).toEqual(456);
      expect(cnt.use(def2)).toEqual(789);
    });

    describe(`init`, () => {
      it.skip(`runs init functions on passing the newly created container`, async () => {
        // const dep = fn.scoped(() => new BoxedValue(Math.random()));

        const dep = scoped<BoxedValue<number>>();

        const cnt = container.new(container => {
          // container.init(use => {
          //   use(dep).value = 1;
          // });
        });

        expect((await cnt.use(dep)).value).toEqual(1);
      });
    });
  });

  describe(`container.scope`, () => {
    it(`accepts asynchronous function`, async () => {
      const cnt = container.new();
      const scope = cnt.scope(async () => {});

      expectType<TypeOf<typeof scope, Promise<IContainer>>>(true);
    });

    it(`accepts synchronous function`, async () => {
      const cnt = container.new();
      const scope = cnt.scope();

      expectType<TypeOf<typeof scope, IContainer>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container.new();
      const scope = cnt.scope();

      expectType<TypeOf<typeof scope, IContainer>>(true);
    });

    it(`correctly configures the scope`, async () => {
      const def = cascading<number>();
      const cnt = container.new();
      const scope = await cnt.scope(async scope => {
        scope.add(def).static(456);
      });

      expect(scope.use(def)).toEqual(456);
    });
  });
});
