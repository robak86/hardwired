import { container } from '../../Container.js';
import type { IInterceptor } from '../interceptor.js';
import { singleton } from '../../../definitions/def-symbol.js';
import type { IDefinition } from '../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';

describe(`interceptor`, () => {
  class TestInterceptor implements IInterceptor<any> {
    readonly id = crypto.randomUUID();

    constructor() {}

    onEnter<TNewInstance>(_definition: IDefinition<TNewInstance, LifeTime>): IInterceptor<TNewInstance> {
      return this as IInterceptor<TNewInstance>;
    }

    onLeave(instance: unknown, _definition: IDefinition<unknown, LifeTime>) {
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
    it(`Calls interceptor methods with correct arguments`, async () => {
      /*
        A -> B  -> C1
                -> C2
      */

      const c1Def = singleton<string>();
      const c2Def = singleton<string>();
      const bDef = singleton<[string, string, string]>();
      const aDef = singleton<[string, [string, string, string]]>();

      const cnt = container.new(c => {
        c.add(c1Def).fn(() => 'C1');
        c.add(c2Def).fn(() => 'C2');
        c.add(bDef).fn((c1, c2) => ['B', c1, c2], c1Def, c2Def);
        c.add(aDef).fn(b => ['A', b], bDef);

        c.withInterceptor('test', new TestInterceptor());
      });
      const interceptor = cnt.getInterceptor('test') as TestInterceptor;

      const onEnterSpy = vi.spyOn(interceptor, 'onEnter');
      const onLeaveSpy = vi.spyOn(interceptor, 'onLeave');

      await cnt.use(aDef);

      expect(interceptor.onEnter).toHaveBeenCalledTimes(4);

      expect(onEnterSpy.mock.calls[0][0].id).toEqual(aDef.id);
      expect(onEnterSpy.mock.calls[1][0].id).toEqual(bDef.id);
      expect(onEnterSpy.mock.calls[2][0].id).toEqual(c1Def.id);
      expect(onEnterSpy.mock.calls[3][0].id).toEqual(c2Def.id);

      expect(onLeaveSpy.mock.calls[0][0]).toEqual('C1');
      expect(onLeaveSpy.mock.calls[0][1].id).toEqual(c1Def.id);

      expect(onLeaveSpy.mock.calls[1][0]).toEqual('C2');
      expect(onLeaveSpy.mock.calls[1][1].id).toEqual(c2Def.id);

      expect(onLeaveSpy.mock.calls[2][0]).toEqual(['B', 'C1', 'C2']);
      expect(onLeaveSpy.mock.calls[2][1].id).toEqual(bDef.id);

      expect(onLeaveSpy.mock.calls[3][0]).toEqual(['A', ['B', 'C1', 'C2']]);
      expect(onLeaveSpy.mock.calls[3][1].id).toEqual(aDef.id);
    });
  });

  describe(`async`, () => {
    it(`Calls interceptor methods with correct arguments`, async () => {
      // const interceptor = new TestInterceptor();

      /*
        A -> B  -> C1
                -> C2
       */

      const c1Def = singleton<string>();
      const c2Def = singleton<string>();
      const bDef = singleton<[string, string, string]>();
      const aDef = singleton<[string, [string, string, string]]>();

      const cnt = container.new(c => {
        c.add(c1Def).fn(async () => 'C1');
        c.add(c2Def).fn(async () => 'C2');
        c.add(bDef).fn(async (c1, c2) => ['B', c1, c2], c1Def, c2Def);
        c.add(aDef).fn(async b => ['A', b], bDef);

        c.withInterceptor('test', new TestInterceptor());
      });

      const interceptor = cnt.getInterceptor('test') as TestInterceptor;

      const onEnterSpy = vi.spyOn(interceptor, 'onEnter');
      const onLeaveSpy = vi.spyOn(interceptor, 'onLeave');

      await cnt.use(aDef);

      expect(interceptor.onEnter).toHaveBeenCalledTimes(4);

      expect(onEnterSpy.mock.calls[0][0].id).toEqual(aDef.id);
      expect(onEnterSpy.mock.calls[1][0].id).toEqual(bDef.id);
      expect(onEnterSpy.mock.calls[2][0].id).toEqual(c1Def.id);
      expect(onEnterSpy.mock.calls[3][0].id).toEqual(c2Def.id);

      expect(await onLeaveSpy.mock.calls[0][0]).toEqual('C1');
      expect(onLeaveSpy.mock.calls[0][1].id).toEqual(c1Def.id);

      expect(await onLeaveSpy.mock.calls[1][0]).toEqual('C2');
      expect(onLeaveSpy.mock.calls[1][1].id).toEqual(c2Def.id);

      expect(await onLeaveSpy.mock.calls[2][0]).toEqual(['B', 'C1', 'C2']);
      expect(onLeaveSpy.mock.calls[2][1].id).toEqual(bDef.id);

      expect(await onLeaveSpy.mock.calls[3][0]).toEqual(['A', ['B', 'C1', 'C2']]);
      expect(onLeaveSpy.mock.calls[3][1].id).toEqual(aDef.id);
    });
  });
});
