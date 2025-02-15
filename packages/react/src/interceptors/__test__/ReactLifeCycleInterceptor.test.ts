import {
  IReactLifeCycleAware,
  reactLifeCycleInterceptor,
  ReactLifeCycleRootInterceptor,
  withReactLifeCycle,
} from '../ReactLifeCycleInterceptor.js';
import { cls, container } from 'hardwired';
import { expect } from 'vitest';

describe(`ReactLifeCycleInterceptor`, () => {
  class NoLifeCycles {
    static instance = cls.scoped(this);
  }

  class ChildSvc1 implements IReactLifeCycleAware {
    static instance = cls.singleton(this);

    onMount = vi.fn();
    onUnmount = vi.fn();
  }

  class ChildSvc2 implements IReactLifeCycleAware {
    static instance = cls.singleton(this);

    onMount = vi.fn();
    onUnmount = vi.fn();
  }

  class Service1 implements IReactLifeCycleAware {
    static instance = cls.scoped(this, [ChildSvc1.instance, ChildSvc2.instance, NoLifeCycles.instance]);

    constructor(
      private _childSvc1: ChildSvc1,
      private _childSvc2: ChildSvc2,
      private _noLifeCycles: NoLifeCycles,
    ) {
      this._childSvc1;
      this._childSvc2;
      this._noLifeCycles;
    }
    onMount = vi.fn();
    onUnmount = vi.fn();
  }

  function setup() {
    const cnt = container.new(withReactLifeCycle);
    const interceptor = cnt.getInterceptor(reactLifeCycleInterceptor) as ReactLifeCycleRootInterceptor<any>;

    return { cnt, interceptor };
  }

  describe(`returning graph node`, () => {
    it(`caches graph nodes`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(ChildSvc1.instance);
      const nodeReq = interceptor.getGraphNode(ChildSvc1.instance);

      cnt.use(ChildSvc1.instance);
      const nodeReq2 = interceptor.getGraphNode(ChildSvc1.instance);

      expect(nodeReq).toBe(nodeReq2);
    });
  });

  describe(`single class dependency`, () => {
    it(`allows getting node for the dependency`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(ChildSvc1.instance);

      expect(interceptor.getGraphNode(ChildSvc1.instance).value).toBeInstanceOf(ChildSvc1);
    });
  });

  describe(`is mountable/unmountable`, () => {
    it(`returns correct values based on the availability of mount/unmount callbacks`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(Service1.instance);

      const svcInterceptor = interceptor.getGraphNode(Service1.instance);

      expect(svcInterceptor.value).toBeInstanceOf(Service1);
      expect(svcInterceptor.isMountable).toBe(true);
      expect(svcInterceptor.isUnmountable).toBe(true);

      expect(interceptor.getGraphNode(NoLifeCycles.instance).isMountable).toBe(false);
      expect(interceptor.getGraphNode(NoLifeCycles.instance).isUnmountable).toBe(false);
    });
  });

  describe(`mount`, () => {
    it(`calls recursively mount on every mountable object`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(Service1.instance);
      interceptor.getGraphNode(Service1.instance).mount();

      const childSvc1 = cnt.use(ChildSvc1.instance);
      const childSvc2 = cnt.use(ChildSvc2.instance);

      expect(childSvc1.onMount).toBeCalled();
      expect(childSvc2.onMount).toBeCalled();
    });

    it(`doesn't call mount on already mounted service`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(Service1.instance);
      interceptor.getGraphNode(Service1.instance).mount();
      interceptor.getGraphNode(Service1.instance).mount();
      interceptor.getGraphNode(Service1.instance).mount();

      const childSvc1 = cnt.use(ChildSvc1.instance);
      const childSvc2 = cnt.use(ChildSvc2.instance);

      expect(childSvc1.onMount).toHaveBeenCalledOnce();
      expect(childSvc2.onMount).toHaveBeenCalledOnce();
    });
  });

  describe(`unmount`, () => {
    it(`calls recursively unmount on every unmountable object`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(Service1.instance);
      interceptor.getGraphNode(Service1.instance).mount();
      interceptor.getGraphNode(Service1.instance).unmount();

      const childSvc1 = cnt.use(ChildSvc1.instance);
      const childSvc2 = cnt.use(ChildSvc2.instance);

      expect(childSvc1.onUnmount).toBeCalled();
      expect(childSvc2.onUnmount).toBeCalled();
    });

    it(`doesn't call unmount on already unmounted service`, async () => {
      const { cnt, interceptor } = setup();

      cnt.use(Service1.instance);
      interceptor.getGraphNode(Service1.instance).mount();
      interceptor.getGraphNode(Service1.instance).unmount();
      interceptor.getGraphNode(Service1.instance).unmount();
      interceptor.getGraphNode(Service1.instance).unmount();

      const childSvc1 = cnt.use(ChildSvc1.instance);
      const childSvc2 = cnt.use(ChildSvc2.instance);

      expect(childSvc1.onUnmount).toHaveBeenCalledOnce();
      expect(childSvc2.onUnmount).toHaveBeenCalledOnce();
    });
  });
});
