import { expectType } from 'ts-expect';
import { describe } from 'vitest';

import { fn } from '../../fn.js';
import { container, Container, once } from '../../../container/Container.js';
import type { LifeTime } from '../../abstract/LifeTime.js';
import type { Definition } from '../Definition.js';
import type { IContainer } from '../../../container/IContainer.js';
import type { TransientDefinition } from '../TransientDefinition.js';

describe(`TransientDefinition`, () => {
  describe(`bind`, () => {
    it(`binds arguments`, async () => {
      const a = fn((use, a: number) => a + 1).bind(123);

      expect(a.call(container)).toEqual(124);
    });

    it(`binds to async`, async () => {
      const a = fn(async (use, a: number) => a + 1).bind(123);
      const result = await a.call(container);

      expect(result).toEqual(124);
    });
  });

  describe(`map`, () => {
    describe(`sync`, () => {
      describe(`types`, () => {
        it(`returns correct type`, async () => {
          const a = fn(() => 0);
          const b = a.map(a => {
            expectType<number>(a);

            return a + 1;
          });

          expectType<Definition<number, LifeTime.transient, []>>(b);
        });

        it(`is called with container instance with lifetimes allowed for transient`, async () => {
          const a = fn(() => 0);
          const singleton = fn.singleton(() => 0);
          const scoped = fn.scoped(() => 0);

          const b = a.map((def, use) => {
            expectType<IContainer<LifeTime.transient>>(use);

            use(singleton); // allowed
            use(scoped); // allowed

            return 0;
          });

          expectType<Definition<number, LifeTime.transient, []>>(b);
        });
      });

      describe('evaluation', () => {
        it(`allows mapping sync values`, async () => {
          const a = fn(() => 0);
          const b = a.map(a => a + 1);
          const result = once(b);

          expect(result).toEqual(1);
        });

        it(`allows multiple chains`, async () => {
          const a = fn(() => 0);
          const b = a.map(a => a + 1);
          const c = b.map(a => a + 1);
          const result = once(c);

          expect(result).toEqual(2);
        });

        it(`propagates errors to the definition instantiation`, async () => {
          const a = fn((): number => {
            throw new Error('error');
          });

          const b = a.map(a => a + 1);

          expect(() => once(b)).toThrowError('error');
        });
      });
    });
  });

  describe(`async`, () => {
    describe(`types`, () => {
      it(`returns async definition`, async () => {
        const a = fn(async () => 0);
        const b = a.map(a => {
          expectType<number>(a);

          return a + 1;
        });

        expectType<Definition<Promise<number>, LifeTime.transient, []>>(b);
      });

      it(`becomes async if previous return type was not a promise`, async () => {
        const a = fn(() => 0);
        const b = a.map(async a => {
          expectType<number>(a);

          return a + 1;
        });

        expectType<Definition<Promise<number>, LifeTime.transient, []>>(b);
      });
    });

    describe(`evaluation`, () => {
      it(`allows mapping async values`, async () => {
        const a = fn(async () => 0);
        const b = a.map(a => a + 1);
        const result = await once(b);

        expect(result).toEqual(1);
      });

      it(`allows multiple chains`, async () => {
        const a = fn(async () => 0);
        const b = a.map(a => a + 1);
        const c = b.map(a => a + 1);
        const result = await once(c);

        expect(result).toEqual(2);
      });

      it(`propagates errors to the definition instantiation`, async () => {
        const a = fn(async (): Promise<number> => {
          throw new Error('error');
        });

        const b = a.map(a => a + 1);

        await expect(once(b)).rejects.toThrowError('error');
      });
    });
  });

  describe(`flatMap`, () => {
    describe(`sync`, () => {
      describe(`types`, () => {
        it(`returns correct types`, async () => {
          const a = fn(() => 0);
          const b = a.flatMap(a => {
            expectType<number>(a);

            return fn(() => a + 1);
          });

          expectType<Definition<number, LifeTime.transient, []>>(b);
        });

        it(`allows remapping to other type `, async () => {
          const a = fn(() => 0);
          const b = a.flatMap(a => {
            expectType<number>(a);

            return fn(() => 'someString');
          });

          expectType<Definition<string, LifeTime.transient, []>>(b);
        });
      });

      describe(`evaluation`, () => {
        it(`returns correct value`, async () => {
          const a = fn(() => 0);
          const b = a.flatMap(a => fn(() => a + 1));

          expect(once(b)).toEqual(1);
        });

        it(`dispatches flatMap callback with correct value`, async () => {
          const a = fn(() => 0);
          const bSpy = vi.fn((a: number) => fn(() => a + 1));
          const b = a.flatMap(bSpy);

          once(b);

          expect(bSpy).toHaveBeenCalledWith(0, expect.any(Container));
        });
      });
    });

    describe(`async`, () => {
      describe(`types`, () => {
        it(`returns async definition`, async () => {
          const a = fn(async () => 0);
          const b = a.flatMap(a => {
            expectType<number>(a);

            return fn(() => a + 1);
          });

          expectType<Definition<Promise<number>, LifeTime.transient, []>>(b);
        });

        it(`becomes async`, async () => {
          const a = fn(() => 0);
          const b = a.flatMap(a => {
            expectType<number>(a);

            return fn(async () => a + 1);
          });

          expectType<Definition<Promise<number>, LifeTime.transient, []>>(b);
        });

        it(`allows remapping to other type `, async () => {
          const a = fn(async () => 0);
          const b = a.flatMap(a => {
            expectType<number>(a);

            return fn(() => 'someString');
          });

          expectType<Definition<Promise<string>, LifeTime.transient, []>>(b);
        });
      });

      describe(`evaluation`, () => {
        it(`returns correct value`, async () => {
          const a = fn(async () => 0);
          const b = a.flatMap(a => fn(() => a + 1));

          expect(await once(b)).toEqual(1);
        });

        it(`dispatches flatMap callback with correct value`, async () => {
          const a = fn(async () => 0);
          const bSpy = vi.fn((a: number) => fn(() => a + 1));
          const b = a.flatMap(bSpy);

          await once(b);

          expect(bSpy).toHaveBeenCalledWith(0, expect.any(Container));
        });
      });
    });
  });

  describe(`mapArgs`, () => {
    describe(`sync`, () => {
      describe(`types`, () => {
        it(`replaces reader args with a new ones`, async () => {
          const a = fn((use, a: number) => a + 1);

          const b = a.mapArgs((use, def, newParam: string) => {
            expectType<IContainer<LifeTime.transient>>(use);
            expectType<Definition<number, LifeTime.transient, [a: number]>>(def);

            return newParam;
          });

          expectType<Definition<string, LifeTime.transient, [a: string]>>(b);
        });
      });

      describe(`eval`, () => {
        it(`returns correct value`, async () => {
          const a = fn((use, a: number) => a + 1);
          const b = a.mapArgs((use, def, newParam: string) => {
            const prev = use.call(def, 0);

            return `prev: ${prev}, newParam: ${newParam}`;
          });

          const result = once(b, 'newOne');

          expect(result).toEqual('prev: 1, newParam: newOne');
        });
      });
    });

    describe(`async`, () => {
      describe(`types`, () => {
        it(`replaces reader args with a new ones`, async () => {
          const a = fn(async (use, a: number) => a + 1);

          const b = a.mapArgs(async (use, def, newParam: string) => {
            expectType<IContainer<LifeTime.transient>>(use);
            expectType<TransientDefinition<Promise<number>, [a: number]>>(def);
            expectType<string>(newParam);

            return newParam;
          });

          expectType<TransientDefinition<Promise<string>, [a: string]>>(b);
        });
      });
    });
  });

  describe(`integration`, () => {
    it(`provides primitives for ad hoc composition`, async () => {
      const repo = fn(async () => {
        return {
          insertUser: async (user: UserParams) => user,
        };
      });

      type UserParams = {
        firstName: string;
        lastName: string;
      };

      const testUserParams = fn(() => ({ firstName: 'John', lastName: 'Doe' }));

      const insertTestUser = testUserParams
        .mapArgs((use, def, userParams: Partial<UserParams>) => {
          return {
            ...use(def),
            ...userParams,
          };
        })
        .map(async (userParams, use) => {
          const repoInstance = await use(repo);

          return repoInstance.insertUser(userParams);
        });

      const result = await once(insertTestUser, { firstName: 'Jane' });

      expect(result).toEqual({
        firstName: 'Jane',
        lastName: 'Doe',
      });
    });
  });

  describe(`wrap`, () => {
    describe(`sync`, () => {
      it(`returns wrapped definition`, async () => {
        const a = fn((_use, initValue: number) => initValue).wrap((use, def, initValue) => {
          return use.call(def, initValue) + 1;
        });

        const result = once(a, 0);

        expect(result).toEqual(1);
      });
    });
  });
});
