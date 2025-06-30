import { container } from '../../Container.js';
import type { IInterceptor } from '../interceptor.js';
import { singleton } from '../../../definitions/tokens.js';

describe(`interceptor`, () => {
  class TestInterceptor implements IInterceptor {
    static create() {
      return new TestInterceptor();
    }

    onInstance<TInstance>(instance: TInstance, dependencies: unknown[]): TInstance {
      return instance;
    }

    onScope(): this {
      return this;
    }
  }

  /*
  A -> B  -> C1
          -> C2
*/

  const c1Def = singleton.token<string>();
  const c2Def = singleton.token<string>();
  const bDef = singleton.token<[string, string, string]>();
  const aDef = singleton.token<[string, [string, string, string]]>();

  describe(`container configuration`, () => {
    describe(`getInterceptor`, () => {
      it(`returns correct instance of interceptor`, async () => {
        const cnt = container(c => c.withInterceptor(TestInterceptor));

        expect(cnt.getInterceptor(TestInterceptor)).toBeInstanceOf(TestInterceptor);
      });
    });
  });

  describe(`sync`, () => {
    it(`Calls interceptor methods with correct arguments`, async () => {
      const cnt = container(c => {
        c.add(c1Def).fn(() => 'C1');
        c.add(c2Def).fn(() => 'C2');
        c.add(bDef)
          .using(c1Def, c2Def)
          .fn((c1, c2) => ['B', c1, c2]);
        c.add(aDef)
          .using(bDef)
          .fn(b => ['A', b]);

        c.withInterceptor(TestInterceptor);
      });
      const interceptor = cnt.getInterceptor(TestInterceptor);

      expect(interceptor).toBeInstanceOf(TestInterceptor);

      const onInstanceSpy = vi.spyOn(interceptor, 'onInstance');

      await cnt.use(aDef);

      expect(onInstanceSpy).toHaveBeenCalledTimes(4);

      expect(onInstanceSpy).toHaveBeenNthCalledWith(
        1,
        'C1',
        [],
        expect.objectContaining({ id: c1Def.id, strategy: c1Def.strategy }),
        [],
      );
      expect(onInstanceSpy).toHaveBeenNthCalledWith(
        2,
        'C2',
        [],
        expect.objectContaining({ id: c2Def.id, strategy: c2Def.strategy }),
        [],
      );
      expect(onInstanceSpy).toHaveBeenNthCalledWith(
        3,
        ['B', 'C1', 'C2'],
        ['C1', 'C2'],
        expect.objectContaining({ id: bDef.id, strategy: bDef.strategy }),
        [
          expect.objectContaining({ id: c1Def.id, strategy: c1Def.strategy }),
          expect.objectContaining({ id: c2Def.id, strategy: c2Def.strategy }),
        ],
      );
      expect(onInstanceSpy).toHaveBeenNthCalledWith(
        4,
        ['A', ['B', 'C1', 'C2']],
        [['B', 'C1', 'C2']],
        expect.objectContaining({ id: aDef.id, strategy: aDef.strategy }),
        [expect.objectContaining({ id: bDef.id, strategy: bDef.strategy })],
      );
    });
  });

  describe(`async`, () => {
    const c1DefAsync = singleton.token<Promise<string>>();
    const c2DefAsync = singleton.token<Promise<string>>();
    const bDefAsync = singleton.token<Promise<[string, string, string]>>();
    const aDefAsync = singleton.token<Promise<[string, [string, string, string]]>>();

    it(`Calls interceptor methods with correct arguments`, async () => {
      const cnt = container(c => {
        c.add(c1DefAsync).fn(async () => 'C1');
        c.add(c2DefAsync).fn(async () => 'C2');
        c.add(bDefAsync)
          .using(c1DefAsync, c2DefAsync)
          .fn(async (c1, c2) => ['B', c1, c2]);
        c.add(aDefAsync)
          .using(bDefAsync)
          .fn(async b => ['A', b]);

        c.withInterceptor(TestInterceptor);
      });

      const interceptor = cnt.getInterceptor(TestInterceptor);

      expect(interceptor).toBeInstanceOf(TestInterceptor);

      const onInstanceSpy = vi.spyOn(interceptor, 'onInstance');

      await cnt.use(aDefAsync);

      expect(onInstanceSpy).toHaveBeenCalledTimes(4);

      expect(onInstanceSpy).toHaveBeenNthCalledWith(
        1,
        'C1',
        [],
        expect.objectContaining({ id: c1DefAsync.id, strategy: c1DefAsync.strategy }),
        [],
      );
      expect(onInstanceSpy).toHaveBeenNthCalledWith(
        2,
        'C2',
        [],
        expect.objectContaining({ id: c2DefAsync.id, strategy: c2DefAsync.strategy }),
        [],
      );
      expect(onInstanceSpy).toHaveBeenNthCalledWith(
        3,
        ['B', 'C1', 'C2'],
        ['C1', 'C2'],
        expect.objectContaining({ id: bDefAsync.id, strategy: bDefAsync.strategy }),
        [
          expect.objectContaining({ id: c1DefAsync.id, strategy: c1DefAsync.strategy }),
          expect.objectContaining({ id: c2DefAsync.id, strategy: c2DefAsync.strategy }),
        ],
      );
      expect(onInstanceSpy).toHaveBeenNthCalledWith(
        4,
        ['A', ['B', 'C1', 'C2']],
        [['B', 'C1', 'C2']],
        expect.objectContaining({ id: aDefAsync.id, strategy: aDefAsync.strategy }),
        [expect.objectContaining({ id: bDefAsync.id, strategy: bDefAsync.strategy })],
      );
    });
  });
});
