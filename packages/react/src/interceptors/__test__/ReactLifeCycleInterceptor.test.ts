import { configureContainer, container, scoped, singleton } from 'hardwired';
import { expect } from 'vitest';

import type { IReactLifeCycleAware } from '../ReactLifeCycleInterceptor.js';
import { ReactLifeCycleRootInterceptor } from '../ReactLifeCycleInterceptor.js';
import { withReactLifeCycle } from '../ReactLifeCycleInterceptor.js';

describe(`ReactLifeCycleInterceptor`, () => {
  const noLifeCyclesD = scoped<NoLifeCycles>('NoLifeCycles');
  const childSvc1D = singleton<ChildSvc1>('ChildSvc1');
  const childSvc2D = singleton<ChildSvc2>('ChildSvc2');
  const service1D = scoped<Service1>('Service1');

  class NoLifeCycles {}

  class ChildSvc1 implements IReactLifeCycleAware {
    onMount = vi.fn();
    onUnmount = vi.fn();
  }

  class ChildSvc2 implements IReactLifeCycleAware {
    onMount = vi.fn();
    onUnmount = vi.fn();
  }

  class Service1 implements IReactLifeCycleAware {
    onMount = vi.fn();
    onUnmount = vi.fn();

    constructor(
      private _childSvc1: ChildSvc1,
      private _childSvc2: ChildSvc2,
      private _noLifeCycles: NoLifeCycles,
    ) {
      void this._childSvc1;
      void this._childSvc2;
      void this._noLifeCycles;
    }
  }

  const registerServices = configureContainer(c => {
    c.add(noLifeCyclesD).class(NoLifeCycles);
    c.add(childSvc1D).class(ChildSvc1);
    c.add(childSvc2D).class(ChildSvc2);
    c.add(service1D).class(Service1, childSvc1D, childSvc2D, noLifeCyclesD);
  });

  function setup() {
    const cnt = container.new(registerServices, withReactLifeCycle());
    const interceptor = cnt.getInterceptorNew(ReactLifeCycleRootInterceptor);

    return { cnt, interceptor };
  }

  describe(`returning graph node`, () => {
    it(`caches graph nodes`, async () => {
      const { cnt, interceptor } = setup();

      await cnt.use(childSvc1D);
      const nodeReq = interceptor.getGraphNode(childSvc1D);

      await cnt.use(childSvc1D);
      const nodeReq2 = interceptor.getGraphNode(childSvc1D);

      expect(nodeReq).toBe(nodeReq2);
    });
  });

  describe(`single class dependency`, () => {
    it(`allows getting node for the dependency`, async () => {
      const { cnt, interceptor } = setup();

      await cnt.use(childSvc1D);

      expect(interceptor.getGraphNode(childSvc1D)?.value).toBeInstanceOf(ChildSvc1);
    });
  });

  describe(`is mountable/unmountable`, () => {
    it(`returns correct values based on the availability of mount/unmount callbacks`, async () => {
      const { cnt, interceptor } = setup();

      await cnt.use(service1D);

      const svcInterceptor = interceptor.getGraphNode(service1D);

      expect(svcInterceptor?.value).toBeInstanceOf(Service1);
      expect(svcInterceptor?.isMountable).toBe(true);
      expect(svcInterceptor?.isUnmountable).toBe(true);

      expect(interceptor.getGraphNode(noLifeCyclesD)?.isMountable).toBe(false);
      expect(interceptor.getGraphNode(noLifeCyclesD)?.isUnmountable).toBe(false);
    });
  });

  describe(`mount`, () => {
    it(`calls recursively mount on every mountable object`, async () => {
      const { cnt, interceptor } = setup();

      await cnt.use(service1D);
      interceptor.getGraphNode(service1D)?.acquire();

      const childSvc1 = await cnt.use(childSvc1D);
      const childSvc2 = await cnt.use(childSvc2D);

      expect(childSvc1.onMount).toBeCalled();
      expect(childSvc2.onMount).toBeCalled();
    });

    it(`doesn't call mount on already mounted service`, async () => {
      const { cnt, interceptor } = setup();

      await cnt.use(service1D);
      interceptor.getGraphNode(service1D)?.acquire();
      interceptor.getGraphNode(service1D)?.acquire();
      interceptor.getGraphNode(service1D)?.acquire();

      const childSvc1 = await cnt.use(childSvc1D);
      const childSvc2 = await cnt.use(childSvc2D);

      expect(childSvc1.onMount).toHaveBeenCalledOnce();
      expect(childSvc2.onMount).toHaveBeenCalledOnce();
    });
  });

  describe(`unmount`, () => {
    it(`calls recursively unmount on every unmountable object`, async () => {
      const { cnt, interceptor } = setup();

      await cnt.use(service1D);
      interceptor.getGraphNode(service1D)?.acquire();
      interceptor.getGraphNode(service1D)?.release();

      const childSvc1 = await cnt.use(childSvc1D);
      const childSvc2 = await cnt.use(childSvc2D);

      expect(childSvc1.onUnmount).toBeCalled();
      expect(childSvc2.onUnmount).toBeCalled();
    });

    it(`doesn't call unmount on already unmounted service`, async () => {
      const { cnt, interceptor } = setup();

      await cnt.use(service1D);
      interceptor.getGraphNode(service1D)?.acquire();
      interceptor.getGraphNode(service1D)?.release();
      interceptor.getGraphNode(service1D)?.release();
      interceptor.getGraphNode(service1D)?.release();

      const childSvc1 = await cnt.use(childSvc1D);
      const childSvc2 = await cnt.use(childSvc2D);

      expect(childSvc1.onUnmount).toHaveBeenCalledOnce();
      expect(childSvc2.onUnmount).toHaveBeenCalledOnce();
    });
  });

  describe(`scopes`, () => {
    it(`calls correctly mount on a singleton definition used by scoped definition instantiated in multiple scopes`, async () => {
      const { cnt, interceptor } = setup();

      const childScope1 = cnt.scope();
      const childScope1Interceptor = childScope1.getInterceptorNew(ReactLifeCycleRootInterceptor);

      const childScope2 = cnt.scope();
      const childScope2Interceptor = childScope2.getInterceptorNew(ReactLifeCycleRootInterceptor);

      await childScope1.use(service1D);
      await childScope2.use(service1D);

      childScope1Interceptor.getGraphNode(service1D)?.acquire();
      childScope2Interceptor.getGraphNode(service1D)?.acquire();

      const childSvc1Node = interceptor.getGraphNode(childSvc1D);
      const childSvc2Node = interceptor.getGraphNode(childSvc2D);

      expect(childSvc1Node?.refCount).toEqual(2);
      expect(childSvc2Node?.refCount).toEqual(2);

      const childSvc1 = await cnt.use(childSvc1D);
      const childSvc2 = await cnt.use(childSvc2D);

      expect(childSvc1.onMount).toHaveBeenCalledTimes(1);
      expect(childSvc2.onMount).toHaveBeenCalledTimes(1);
      expect(childSvc1.onUnmount).not.toBeCalled();
      expect(childSvc2.onUnmount).not.toBeCalled();

      childScope1Interceptor.getGraphNode(service1D)?.release();

      expect(childSvc1.onMount).toHaveBeenCalledTimes(1);
      expect(childSvc2.onMount).toHaveBeenCalledTimes(1);

      expect(childSvc1.onUnmount).not.toBeCalled();
      expect(childSvc2.onUnmount).not.toBeCalled();

      childScope2Interceptor.getGraphNode(service1D)?.release();

      expect(childSvc1.onMount).toHaveBeenCalledTimes(1);
      expect(childSvc2.onMount).toHaveBeenCalledTimes(1);

      expect(childSvc1.onUnmount).toHaveBeenCalledTimes(1);
      expect(childSvc2.onUnmount).toHaveBeenCalledTimes(1);
    });
  });
});
