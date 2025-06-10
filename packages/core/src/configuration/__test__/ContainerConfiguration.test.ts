import type { TypeOf } from 'ts-expect';
import { expectType } from 'ts-expect';
import { describe, expect } from 'vitest';

import type { Container } from '../../container/Container.js';
import { container } from '../../container/Container.js';
import type { IContainer } from '../../container/IContainer.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { cascading, scoped, singleton, transient } from '../../definitions/tokens.js';
import { configureContainer } from '../ContainerConfiguration.js';
import { configureScope } from '../ScopeConfiguration.js';

describe(`ContainerConfiguration`, () => {
  describe.skip(`eager`, () => {
    describe('types', () => {
      it(`allows using async functions for decorate and configure`, async () => {
        const def = cascading<BoxedValue<number>>('testCascadingDef');

        const cnt = container(c => {
          c.eager(def).decorate(async val => val);
        });

        expect(await cnt.use(def)).toMatchObject({ value: 789 });
      });
    });
  });

  describe(`modify`, () => {
    describe(`cascading`, () => {
      describe(`decorate`, () => {
        it(`modify is applicative`, async () => {
          const def = cascading<number>('testCascadingDef');

          const cnt = container(c => {
            c.add(def).static(0);

            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          const child = cnt.scope(c => {
            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 10);
          });

          const child2 = child.scope(c => {
            c.modify(def).claimNew();
          });

          const child3 = child2.scope(c => {
            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          expect(await cnt.use(def)).toEqual(2);
          expect(await child.use(def)).toEqual(11);
          expect(await child2.use(def)).toEqual(0);
          expect(await child3.use(def)).toEqual(2);
        });

        it(`throws when definition wasn't registered`, async () => {
          const def = cascading<number>('testCascadingDef');

          expect(() => {
            const cnt = container(c => {
              c.modify(def).decorate(val => val + 1);
            });

            cnt.use(def);
          }).toThrow('Cannot find definition for Symbol(testCascadingDef)');
        });
      });

      describe(`inherit`, () => {
        it(`inherits value from the parent scope`, async () => {
          const def = cascading<string>('testCascadingDef');

          const scopeConfig = configureScope(scope => {
            scope.modify(def).inherit(value => {
              return value + '_inherited';
            });
          });

          const root = container(c => c.add(def).static('root'));

          expect(root.use(def)).toEqual('root');

          const scope = root.scope(scopeConfig);

          expect(scope.use(def)).toEqual('root_inherited');
        });

        it(`inherits value from the parent scope`, async () => {
          const def = cascading<number>('testCascadingDef');

          const cnt = container(c => {
            c.add(def).static(0);
          });

          const child = cnt.scope(c => {
            c.modify(def).inherit(val => val + 1);
          });

          // TODO:

          // const child = cnt.scope(c => {
          //   c.modify(def)
          //     .inherit(val => val + 1)
          //     .onDispose(val => {});
          // });

          expect(cnt.use(def)).toEqual(0);
          expect(child.use(def)).toEqual(1);
        });

        it(`throws when definition is not registered in the parent scope`, async () => {
          const def = cascading<number>('testCascadingDef');

          configureContainer(c => {
            // @ts-expect-error inherit is not available from the root configuration
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            c.modify(def).inherit;
          });
        });

        it(`throws when there is already modification for the current scope`, async () => {
          const def = cascading<number>('testCascadingDef');

          const cnt = container(c => {
            c.add(def).static(0);
          });

          const createScope = () =>
            cnt.scope(c => {
              c.modify(def).static(10);
              c.modify(def).inherit(val => val);
            });

          expect(createScope).toThrowError(
            'Cannot inherit from Symbol(testCascadingDef). It is already modified in the current scope.',
          );
        });

        it(`memorizes inherit factory result`, async () => {
          const def = cascading<number>('testCascadingDef');

          const inheritFactorySpy = vi.fn((val: number) => val + 1);

          const cnt = container(c => {
            c.add(def).static(0);
          });

          const child = cnt.scope(c => {
            c.modify(def).inherit(inheritFactorySpy);
          });

          await child.use(def);
          await child.use(def);
          await child.use(def);

          expect(inheritFactorySpy).toHaveBeenCalledTimes(1);
        });

        it(`can be combined with modify`, async () => {
          const def = cascading<number>('testCascadingDef');

          const cnt = container(c => {
            c.add(def).static(0);
          });

          const child = cnt.scope(c => {
            c.modify(def).inherit(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          expect(await cnt.use(def)).toEqual(0);
          expect(await child.use(def)).toEqual(2);
        });
      });

      describe(`cascade`, () => {
        it(`is not available from the container config`, async () => {
          const def = cascading<number>('testCascadingDef');

          configureContainer(c => {
            // @ts-expect-error cascade is not available from the root configuration
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            c.modify(def).cascade;
          });
        });
      });
    });

    describe(`scoped`, () => {
      describe(`decorate`, () => {
        it(`modify is applicative`, async () => {
          const def = scoped<number>('testCascadingDef');

          const cnt = container(c => {
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
            const cnt = container(c => {
              c.modify(def).decorate(val => val + 1);
            });

            cnt.use(def);
          }).toThrow('Cannot find definition for Symbol(testCascadingDef)');
        });
      });
    });

    describe(`singleton`, () => {
      describe(`decorate`, () => {
        it(`modify is applicative`, async () => {
          const def = singleton<number>('testCascadingDef');

          const cnt = container(c => {
            c.add(def).static(0);

            c.modify(def).decorate(val => val + 1);
            c.modify(def).decorate(val => val + 1);
          });

          expect(await cnt.use(def)).toEqual(2);
        });

        it(`throws when definition wasn't registered`, async () => {
          const def = singleton<number>('testCascadingDef');

          expect(() => {
            const cnt = container(c => {
              c.modify(def).decorate(val => val + 1);
            });

            cnt.use(def);
          }).toThrow('Cannot find definition for Symbol(testCascadingDef)');
        });
      });
    });

    describe(`transient`, () => {
      describe(`decorate`, () => {
        it.todo(`modify is applicative`, async () => {
          const def = transient<number>('testCascadingDef');

          const cfg1 = configureContainer(c => {
            c.add(def).static(0);

            c.modify(def).decorate(val => val + 1);
          });

          const cfg2 = configureContainer(c => {
            c.modify(def).decorate(val => val + 1);
          });

          const cnt = container(cfg1, cfg2);

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
          const def = transient<number>('testCascadingDef');

          expect(() => {
            const cnt = container(c => {
              c.modify(def).decorate(val => val + 1);
            });

            cnt.use(def);
          }).toThrow('Cannot find definition for Symbol(testCascadingDef)');
        });
      });
    });
  });

  describe(`container#freeze`, () => {
    it(`allows freezing instances before they are created`, async () => {
      const def = scoped<number>();
      const cnt = container();

      cnt.freeze(def).static(456);
      expect(cnt.use(def)).toEqual(456);
    });

    it(`supports configure`, async () => {
      const def = scoped<BoxedValue<number>>();
      const cnt = container(c => c.add(def).static(new BoxedValue(123)));

      cnt.freeze(def).configure(c => {
        c.value = 456;
      });
      expect(cnt.use(def)).toMatchObject({ value: 456 });
    });

    it(`supports decorate`, async () => {
      const def = scoped<BoxedValue<number>>();
      const cnt = container(c => c.add(def).static(new BoxedValue(123)));

      cnt.freeze(def).decorate(c => {
        return new BoxedValue(456);
      });
      expect(cnt.use(def)).toMatchObject({ value: 456 });
    });

    it(`does not support inherit`, async () => {
      const def = scoped<BoxedValue<number>>();
      const cnt = container(c => c.add(def).static(new BoxedValue(123)));

      // @ts-expect-error inherit is not available from the root configuration
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      cnt.freeze(def).inherit;
    });

    it(`throws if the instances is already created`, async () => {
      const def = scoped<number>();

      const cnt = container(c => {
        c.add(def).static(123);
      });

      await cnt.use(def);

      expect(() => cnt.freeze(def).static(456)).toThrowError('already instantiated');
    });

    it(`throws if the instances is already created on the parent scope`, async () => {
      const def = cascading<number>();

      const cnt = container(c => {
        c.add(def).static(123);
      });

      await cnt.use(def);

      const scope = cnt.scope();

      expect(() => scope.freeze(def).static(456)).toThrowError('already instantiated');
    });

    it(`works with child scopes`, async () => {
      const def = scoped<number>();

      const cnt = container(c => {
        c.add(def).static(123);
      });

      const scope = cnt.scope();

      scope.freeze(def).static(456);
      expect(scope.use(def)).toEqual(456);
    });

    it(`throws when cascading definition was created in child scope`, async () => {
      const def = cascading<number>();

      const cnt = container(c => {
        c.add(def).static(123);
      });

      const scope1 = cnt.scope(s => s.modify(def).claimNew());

      await scope1.use(def);

      const scope2 = scope1.scope();

      expect(() => scope2.freeze(def).static(456)).toThrowError('already instantiated');
    });
  });

  describe(`container.new`, () => {
    it(`accepts synchronous function`, async () => {
      const cnt = container(_c => {});

      expectType<TypeOf<typeof cnt, Container>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container();

      expectType<TypeOf<typeof cnt, Container>>(true);
    });

    it(`accepts multiple config functions`, async () => {
      const def1 = scoped<number>();
      const def2 = scoped<number>();

      const cnt = container(
        container => {
          container.add(def1).static(456);
        },
        container => {
          container.add(def2).static(789);
        },
      );

      expect(cnt.use(def1)).toEqual(456);
      expect(cnt.use(def2)).toEqual(789);
    });

    describe(`init`, () => {
      it.skip(`runs init functions on passing the newly created container`, async () => {
        const dep = scoped<BoxedValue<number>>();

        const cnt = container(container => {
          // container.init(use => {
          //   use(dep).value = 1;
          // });
        });

        expect((await cnt.use(dep)).value).toEqual(1);
      });
    });
  });

  describe(`container.scope`, () => {
    it(`accepts synchronous function`, async () => {
      const cnt = container();
      const scope = cnt.scope();

      expectType<TypeOf<typeof scope, IContainer>>(true);
    });

    it(`returns container synchronously when no configuration is passed`, async () => {
      const cnt = container();
      const scope = cnt.scope();

      expectType<TypeOf<typeof scope, IContainer>>(true);
    });

    it(`correctly configures the scope`, async () => {
      const def = cascading<number>();
      const cnt = container();
      const scope = cnt.scope(scope => {
        scope.add(def).static(456);
      });

      expect(scope.use(def)).toEqual(456);
    });
  });
});
