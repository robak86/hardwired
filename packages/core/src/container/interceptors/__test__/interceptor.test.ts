import { container } from '../../Container.js';
import { IInterceptor } from '../interceptor.js';
import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { fn } from '../../../definitions/definitions.js';
import { Mocked } from 'vitest';
import {BindingsRegistry} from "../../../context/BindingsRegistry.js";
import {InstancesStore} from "../../../context/InstancesStore.js";

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

  describe(`sync`, () => {
    it(`Calls interceptor methods with correct arguments`, () => {
      const interceptor = new TestInterceptor();

      const cnt = container.new(c => c.withInterceptor('test', interceptor));

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
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(1, a, [], expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(2, b, [], expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(3, c1, [], expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(4, c2, [], expect.any(BindingsRegistry), expect.any(InstancesStore));

      expect(interceptor.onLeave).toHaveBeenCalledTimes(4);
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(1, 'C1', c1, expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(2, 'C2', c2, expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(3, ['B', 'C1', 'C2'], b, expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(4, ['A', ['B', 'C1', 'C2']], a, expect.any(BindingsRegistry), expect.any(InstancesStore));
    });
  });

  describe(`async`, () => {
    it(`Calls interceptor methods with correct arguments`, async () => {
      const interceptor = new TestInterceptor();
      const cnt = container.new(c => c.withInterceptor('test', interceptor));

      vi.spyOn(interceptor, 'onEnter');
      vi.spyOn(interceptor, 'onLeave');

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
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(1, a, [], expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(2, b, [], expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(3, c1, [], expect.any(BindingsRegistry), expect.any(InstancesStore));
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(4, c2, [], expect.any(BindingsRegistry), expect.any(InstancesStore));

      const onLeaveCalls = (interceptor.onLeave as Mocked<any>).mock.calls;

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
