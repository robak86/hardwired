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

  const c1Def = singleton<string>();
  const c2Def = singleton<string>();
  const bDef = singleton<[string, string, string]>();
  const aDef = singleton<[string, [string, string, string]]>();

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
        c.add(bDef).fn((c1, c2) => ['B', c1, c2], c1Def, c2Def);
        c.add(aDef).fn(b => ['A', b], bDef);

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
    it(`Calls interceptor methods with correct arguments`, async () => {
      const cnt = container(c => {
        c.add(c1Def).asyncFn(async () => 'C1');
        c.add(c2Def).asyncFn(async () => 'C2');
        c.add(bDef).asyncFn(async (c1, c2) => ['B', c1, c2], c1Def, c2Def);
        c.add(aDef).asyncFn(async b => ['A', b], bDef);

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
});
