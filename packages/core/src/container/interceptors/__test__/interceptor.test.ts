import { Container } from '../../Container.js';
import { BindingsRegistry } from '../../../context/BindingsRegistry.js';
import { InstancesStore } from '../../../context/InstancesStore.js';
import { IInterceptor } from '../interceptor.js';
import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { fn } from '../../../definitions/definitions.js';

describe(`interceptor`, () => {
  class TestInterceptor implements IInterceptor<any> {
    constructor() {}

    onEnter<TNewInstance>(
      definition: Definition<TNewInstance, LifeTime, any[]>,
      ...args: any[]
    ): IInterceptor<TNewInstance> {
      console.log('onEnter', definition.create.toString());
      return this;
    }

    onLeave(instance: any) {
      console.log('onLeave', instance);
      return instance;
    }
  }

  describe(`sync`, () => {
    it(`Calls interceptor methods with correct arguments`, () => {
      const interceptor = new TestInterceptor();
      const cnt = new Container(null, BindingsRegistry.create(), InstancesStore.create()).withInterceptor(interceptor);

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
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(1, 'C1');
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(2, 'C2');
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(3, ['B', 'C1', 'C2']);
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(4, ['A', ['B', 'C1', 'C2']]);
    });
  });

  describe.skip(`async`, () => {
    it(`Calls interceptor methods with correct arguments`, () => {
      const interceptor = new TestInterceptor();
      const cnt = new Container(null, BindingsRegistry.create(), InstancesStore.create()).withInterceptor(interceptor);

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

      cnt.use(a);

      expect(interceptor.onEnter).toHaveBeenCalledTimes(4);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(1, a, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(2, b, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(3, c1, []);
      expect(interceptor.onEnter).toHaveBeenNthCalledWith(4, c2, []);

      expect(interceptor.onLeave).toHaveBeenCalledTimes(4);
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(1, 'C1');
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(2, 'C2');
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(3, ['B', 'C1', 'C2']);
      expect(interceptor.onLeave).toHaveBeenNthCalledWith(4, ['A', ['B', 'C1', 'C2']]);
    });
  });
});
