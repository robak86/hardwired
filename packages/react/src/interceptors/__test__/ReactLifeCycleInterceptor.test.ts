import { configureContainer, container, scoped, singleton } from 'hardwired';
import { expect } from 'vitest';

import type { IReactLifeCycleAware } from '../ReactLifeCycleInterceptor.js';
import { ReactLifeCycleRootInterceptor, withReactLifeCycle } from '../ReactLifeCycleInterceptor.js';

describe(`ReactLifeCycleInterceptor`, () => {
  const noLifeCyclesD = scoped.token<NoLifeCycles>('NoLifeCycles');
  const childSvc1D = singleton.token<ChildSvc1>('ChildSvc1');
  const childSvc2D = singleton.token<ChildSvc2>('ChildSvc2');
  const service1D = scoped.token<Service1>('Service1');

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
    c.add(service1D).using(childSvc1D, childSvc2D, noLifeCyclesD).class(Service1);
  });

  function setup() {
    const cnt = container(registerServices, withReactLifeCycle());
    const interceptor = cnt.getInterceptor(ReactLifeCycleRootInterceptor);

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

    it(`works with deferred definitions`, async () => {
      class Dependency {
        static instance = singleton.class(this);
      }

      class DeferredCls {
        static instance = singleton.arg<number>().using(Dependency.instance).class(this);

        constructor(public value: number) {}
      }

      const cnt = container(withReactLifeCycle());

      const factoryFn = cnt.use(DeferredCls.instance);

      expect(factoryFn).toBeInstanceOf(Function);

      const instance = factoryFn(42);

      expect(instance).toBeInstanceOf(DeferredCls);
      expect(instance.value).toBe(42);

      const interceptor = cnt.getInterceptor(ReactLifeCycleRootInterceptor);

      interceptor.getGraphNode(DeferredCls.instance);
    });

    it(`works with singletons propagated from a child scope`, async () => {
      class DeferredCls {
        static instance = singleton.class(this);

        constructor() {}
      }

      const cnt = container(withReactLifeCycle());

      const scope = cnt.scope();

      const instance = scope.use(DeferredCls.instance);

      expect(instance).toBeInstanceOf(DeferredCls);

      const interceptor = scope.getInterceptor(ReactLifeCycleRootInterceptor);

      const node = interceptor.getGraphNode(DeferredCls.instance);

      expect(node).toBeDefined();
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

      cnt.use(service1D);
      interceptor.getGraphNode(service1D)?.acquire();

      const childSvc1 = cnt.use(childSvc1D);
      const childSvc2 = cnt.use(childSvc2D);

      expect(childSvc1.onMount).toBeCalled();
      expect(childSvc2.onMount).toBeCalled();
    });

    it(`doesn't call mount on already mounted service`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(service1D);
      interceptor.getGraphNode(service1D)?.acquire();
      interceptor.getGraphNode(service1D)?.acquire();
      interceptor.getGraphNode(service1D)?.acquire();

      const childSvc1 = cnt.use(childSvc1D);
      const childSvc2 = cnt.use(childSvc2D);

      expect(childSvc1.onMount).toHaveBeenCalledOnce();
      expect(childSvc2.onMount).toHaveBeenCalledOnce();
    });
  });

  describe(`unmount`, () => {
    it(`calls recursively unmount on every unmountable object`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(service1D);
      interceptor.getGraphNode(service1D)?.acquire();
      interceptor.getGraphNode(service1D)?.release();

      const childSvc1 = cnt.use(childSvc1D);
      const childSvc2 = cnt.use(childSvc2D);

      expect(childSvc1.onUnmount).toBeCalled();
      expect(childSvc2.onUnmount).toBeCalled();
    });

    it(`doesn't call unmount on already unmounted service`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(service1D);
      interceptor.getGraphNode(service1D)?.acquire();
      interceptor.getGraphNode(service1D)?.release();
      interceptor.getGraphNode(service1D)?.release();
      interceptor.getGraphNode(service1D)?.release();

      const childSvc1 = cnt.use(childSvc1D);
      const childSvc2 = cnt.use(childSvc2D);

      expect(childSvc1.onUnmount).toHaveBeenCalledOnce();
      expect(childSvc2.onUnmount).toHaveBeenCalledOnce();
    });
  });

  describe(`scopes`, () => {
    it(`calls correctly mount on a singleton definition used by scoped definition instantiated in multiple scopes`, async () => {
      const { cnt, interceptor } = setup();

      const childScope1 = cnt.scope();
      const childScope1Interceptor = childScope1.getInterceptor(ReactLifeCycleRootInterceptor);

      const childScope2 = cnt.scope();
      const childScope2Interceptor = childScope2.getInterceptor(ReactLifeCycleRootInterceptor);

      childScope1.use(service1D);
      childScope2.use(service1D);

      childScope1Interceptor.getGraphNode(service1D)?.acquire();
      childScope2Interceptor.getGraphNode(service1D)?.acquire();

      const childSvc1Node = interceptor.getGraphNode(childSvc1D);
      const childSvc2Node = interceptor.getGraphNode(childSvc2D);

      expect(childSvc1Node?.refCount).toEqual(2);
      expect(childSvc2Node?.refCount).toEqual(2);

      const childSvc1 = cnt.use(childSvc1D);
      const childSvc2 = cnt.use(childSvc2D);

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
