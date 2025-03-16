import { container } from '../../Container.js';
import type { IInterceptor } from '../interceptor.js';
import type { Definition } from '../../../definitions/impl/Definition.js';
import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { fn } from '../../../definitions/fn.js';

describe(`interceptor`, () => {
  class TestInterceptor implements IInterceptor<any> {
    constructor() {}

    onEnter<TNewInstance>(
      definition: Definition<TNewInstance, LifeTime, any[]>,
      ...args: any[]
    ): IInterceptor<TNewInstance> {
      return this;
    }

    onLeave(instance: any) {
      return instance;
    }

    onScope(): IInterceptor<any> {
      return this;
    }
  }

  describe(`container configuration`, () => {
    describe(`getInterceptor`, () => {
      it(`returns correct instance of interceptor`, async () => {
        const interceptor = new TestInterceptor();
        const interceptorId = Symbol('test');
        const cnt = container.new(c => c.withInterceptor(interceptorId, interceptor));

        expect(cnt.getInterceptor(interceptorId)).toBe(interceptor);
      });
    });
  });

  describe(`sync`, () => {
    it(`Calls interceptor methods with correct arguments`, () => {
      const cnt = container.new(c => c.withInterceptor('test', new TestInterceptor()));
      const interceptor = cnt.getInterceptor('test') as TestInterceptor;

      vi.spyOn(interceptor, 'onEnter');
      vi.spyOn(interceptor, 'onLeave');

      /*
        A -> B  -> C1
                -> C2
       */
      const c1 = fn.singleton(use => 'C1');
      const c2 = fn.singleton(use => 'C2');
      const b = fn.singleton(use => ['B', use(c1), use(c2)]);
      const a = fn.singleton(use => ['A', use(b)]);

      cnt.use(a);

      expect(interceptor.onEnter).toHaveBeenCalledTimes(4);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(1, a, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(2, b, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(3, c1, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(4, c2, []);

      expect(interceptor.onLeave).toHaveBeenCalledTimes(4);
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(1, 'C1', c1);
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(2, 'C2', c2);
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(3, ['B', 'C1', 'C2'], b);
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(4, ['A', ['B', 'C1', 'C2']], a);
    });
  });

  describe(`async`, () => {
    it(`Calls interceptor methods with correct arguments`, async () => {
      const interceptor = new TestInterceptor();
      const cnt = container.new(c => c.withInterceptor('test', interceptor));

      vi.spyOn(interceptor, 'onEnter');
      const onLeaveSpy = vi.spyOn(interceptor, 'onLeave');

      /*
        A -> B  -> C1
                -> C2
       */
      const c1 = fn.singleton(async use => 'C1');
      const c2 = fn.singleton(async use => 'C2');
      const b = fn.singleton(async use => ['B', await use(c1), await use(c2)]);
      const a = fn.singleton(async use => ['A', await use(b)]);

      await cnt.use(a);

      expect(interceptor.onEnter).toHaveBeenCalledTimes(4);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(1, a, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(2, b, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(3, c1, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(4, c2, []);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const onLeaveCalls = onLeaveSpy.mock.calls as any;

      expect(onLeaveCalls).toHaveLength(4);
      expect(await onLeaveCalls[0][0]).toEqual('C1');
      expect(await onLeaveCalls[0][1]).toEqual(c1);

      expect(await onLeaveCalls[1][0]).toEqual(['B', 'C1', 'C2']);
      expect(await onLeaveCalls[1][1]).toEqual(b);

      expect(await onLeaveCalls[2][0]).toEqual(['A', ['B', 'C1', 'C2']]);
      expect(await onLeaveCalls[2][1]).toEqual(a);

      expect(await onLeaveCalls[3][0]).toEqual('C2');
      expect(await onLeaveCalls[3][1]).toEqual(c2);
    });
  });
});
