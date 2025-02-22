import { ReactLifeCycleNode } from '../ReactLifeCycleNode.js';

describe(`ReactLifeCycleNode`, () => {
  describe(`only mount method defined`, () => {
    it(`calls mount on mountable object`, async () => {
      const mountable = { onMount: vi.fn() };
      const node = new ReactLifeCycleNode(mountable);
      node.acquire();
      expect(mountable.onMount).toHaveBeenCalledTimes(1);
    });

    it(`recursively calls mount on children even if the parent is not mountable`, async () => {
      const mountable = new ReactLifeCycleNode({ onMount: vi.fn() });
      const notMountableParent = new ReactLifeCycleNode({}, [mountable]);

      notMountableParent.acquire();
      expect(mountable.value.onMount).toHaveBeenCalledTimes(1);
    });

    it(`doesn't call mount on already mounted node`, async () => {
      const mountable = new ReactLifeCycleNode({ onMount: vi.fn() });
      const node = new ReactLifeCycleNode({}, [mountable, mountable]);
      node.acquire();
      node.acquire();
      expect(mountable.value.onMount).toHaveBeenCalledTimes(1);
    });

    describe(`forceMount`, () => {
      it(`remounts already mounted node`, async () => {
        const mountable = new ReactLifeCycleNode({ onMount: vi.fn() });

        mountable.acquire();
        expect(mountable.value.onMount).toHaveBeenCalledTimes(1);

        mountable.acquire(true);
        expect(mountable.value.onMount).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe(`only unmount method defined`, () => {
    it(`calls unmount on unmountable object`, async () => {
      const unmountable = { onUnmount: vi.fn() };
      const node = new ReactLifeCycleNode(unmountable);
      node.acquire();
      node.release();
      expect(unmountable.onUnmount).toHaveBeenCalledTimes(1);
    });

    it(`recursively calls unmount on children even if the parent is not unmountable`, async () => {
      const unmountable = new ReactLifeCycleNode({ onUnmount: vi.fn() });
      const notUnmountableParent = new ReactLifeCycleNode({}, [unmountable]);

      notUnmountableParent.acquire();
      notUnmountableParent.release();
      expect(unmountable.value.onUnmount).toHaveBeenCalledTimes(1);
    });

    it(`doesn't call unmount on already unmounted node`, async () => {
      const unmountable = new ReactLifeCycleNode({ onUnmount: vi.fn() });
      const node = new ReactLifeCycleNode({}, [unmountable]);
      node.acquire();
      node.release();
      node.release();
      expect(unmountable.value.onUnmount).toHaveBeenCalledTimes(1);
    });

    it(`doesn't unmount object unless if was reference from multiple other objects. (onMount called multiple times)`, async () => {
      const shared = new ReactLifeCycleNode({ onUnmount: vi.fn() });
      const consumer1 = new ReactLifeCycleNode({}, [shared]);
      const consumer2 = new ReactLifeCycleNode({}, [shared]);

      consumer1.acquire();
      consumer2.acquire();

      consumer1.release();

      expect(shared.value.onUnmount).toHaveBeenCalledTimes(0);

      consumer2.release();
      expect(shared.value.onUnmount).toHaveBeenCalledTimes(1);
    });

    describe(`forceMount`, () => {
      it(`correctly unmounts`, async () => {
        const mountable = new ReactLifeCycleNode({ onUnmount: vi.fn() });

        mountable.acquire();
        expect(mountable.value.onUnmount).toHaveBeenCalledTimes(0);

        mountable.acquire(true);
        expect(mountable.value.onUnmount).toHaveBeenCalledTimes(0);

        mountable.release();
        expect(mountable.value.onUnmount).toHaveBeenCalledTimes(1);
      });
    });

    describe(`forceUnmount`, () => {
      it(`calls onUnmount even if the node is still referenced`, async () => {
        const mountable = new ReactLifeCycleNode({ onUnmount: vi.fn() });

        mountable.acquire();
        expect(mountable.value.onUnmount).toHaveBeenCalledTimes(0);

        mountable.acquire();
        expect(mountable.value.onUnmount).toHaveBeenCalledTimes(0);

        mountable.release(true); // two reference to the node. onUnmount shouldn't be called unless forceUnmount is true
        expect(mountable.value.onUnmount).toHaveBeenCalledTimes(1);

        mountable.release();
        expect(mountable.value.onUnmount).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe(`mount and unmount defined`, () => {
    it(`calls mount and unmount on mountable and unmountable object`, async () => {
      const node = new ReactLifeCycleNode({ onMount: vi.fn(), onUnmount: vi.fn() });
      node.acquire();
      node.release();
      expect(node.value.onMount).toHaveBeenCalledTimes(1);
      expect(node.value.onUnmount).toHaveBeenCalledTimes(1);
    });

    it(`doesn't unmount object unless if was reference from multiple other objects. (onMount called multiple times)`, async () => {
      const shared = new ReactLifeCycleNode({ onMount: vi.fn(), onUnmount: vi.fn() });
      const consumer1 = new ReactLifeCycleNode({}, [shared]);
      const consumer2 = new ReactLifeCycleNode({}, [shared]);

      consumer1.acquire();
      consumer2.acquire();

      consumer1.release();

      expect(shared.value.onMount).toHaveBeenCalledTimes(1);
      expect(shared.value.onUnmount).toHaveBeenCalledTimes(0);

      consumer2.release();
      expect(shared.value.onUnmount).toHaveBeenCalledTimes(1);
    });

    it(`recursively calls mount and unmount on children even if the parent is not mountable`, async () => {
      const mountable = new ReactLifeCycleNode({ onMount: vi.fn(), onUnmount: vi.fn() });

      const notMountableParent = new ReactLifeCycleNode({}, [mountable, mountable]);

      notMountableParent.acquire();
      notMountableParent.release();
      expect(mountable.value.onMount).toHaveBeenCalledTimes(1);
      expect(mountable.value.onUnmount).toHaveBeenCalledTimes(1);
    });

    it(`doesn't call mount and unmount on already mounted and unmounted node`, async () => {
      const mountable = new ReactLifeCycleNode({ onMount: vi.fn() });
      const unmountable = new ReactLifeCycleNode({ onUnmount: vi.fn() });
      const node = new ReactLifeCycleNode({}, [mountable, unmountable]);

      node.acquire();
      node.release();
      node.acquire();
      node.release();
      node.release();
      expect(mountable.value.onMount).toHaveBeenCalledTimes(2);
      expect(unmountable.value.onUnmount).toHaveBeenCalledTimes(2);
    });
  });
});
