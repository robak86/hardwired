import { Definition } from '../../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import { BaseInterceptor, BaseRootInterceptor } from '../BaseInterceptor.js';
import { container } from '../../../Container.js';
import { fn } from '../../../../definitions/definitions.js';
import { ContainerConfigureFn } from '../../../../configuration/ContainerConfiguration.js';

describe(`BaseInterceptor`, () => {
  class Node<T> extends BaseInterceptor<T> {
    create<TNewInstance>(
      parent?: BaseInterceptor<T> | undefined,
      definition?: Definition<TNewInstance, LifeTime, any[]> | undefined,
    ): BaseInterceptor<TNewInstance> {
      return new Node(parent, definition);
    }
  }

  class Root<T> extends BaseRootInterceptor<T> {
    create<TNewInstance>(
      parent?: BaseInterceptor<T> | undefined,
      definition?: Definition<TNewInstance, LifeTime, any[]> | undefined,
    ): BaseInterceptor<TNewInstance> {
      return new Node(parent, definition);
    }
  }

  function setup(...setupFns: ContainerConfigureFn[]) {
    const cnt = container.new(c => c.withInterceptor('graph', new Root()), ...setupFns);
    const interceptor = cnt.getInterceptor('graph') as Root<any>;

    return { cnt, interceptor };
  }

  describe(`getNode`, () => {
    it(`caches node instances`, async () => {
      const { cnt, interceptor } = setup();
      const def = fn.singleton(() => 1);

      cnt.use(def);
      const nodeReq1 = interceptor.getGraphNode(def);
      expect(nodeReq1.value).toBe(1);

      cnt.use(def);
      const nodeReq2 = interceptor.getGraphNode(def);
      expect(nodeReq2).toBe(nodeReq1);
    });
  });

  describe(`scopes`, () => {
    it('propagates singletons to the root', async () => {
      const { cnt, interceptor } = setup();
      const def = fn.singleton(() => 1);

      const childScope = cnt.scope();
      childScope.use(def);

      const node = interceptor.getGraphNode(def);
      expect(node.value).toBe(1);
    });

    it(`doesn't propagate scoped definitions`, async () => {
      const { cnt } = setup();
      const def = fn.scoped(() => 1);

      cnt.use(def); // memoize scoped in the root container and root level interceptor

      const childScope = cnt.scope(c => {
        return c.bindLocal(def).toValue(123);
      });

      const rootInterceptor = cnt.getInterceptor('graph') as Root<any>;
      const childInterceptor = childScope.getInterceptor('graph') as Node<any>;

      childScope.use(def); // memoize scoped in the child container and child interceptor

      expect(childInterceptor.getGraphNode(def)?.value).toEqual(123);
      expect(rootInterceptor.getGraphNode(def)?.value).toEqual(1);
    });

    it(`has correct children`, async () => {
      const { cnt } = setup();
      const shared = fn.singleton(() => 1);
      const consumer = fn.scoped(use => ({ c: use(shared) }));

      const rootInterceptor = cnt.getInterceptor('graph') as Root<any>;

      const scope1 = cnt.scope();
      const scope1Interceptor = scope1.getInterceptor('graph') as Node<any>;

      const scope2 = cnt.scope();
      const scope2Interceptor = scope2.getInterceptor('graph') as Node<any>;

      scope1.use(consumer);
      scope2.use(consumer);

      const sharedDefNode = rootInterceptor.getGraphNode(shared);

      const scope1ConsumerNode = scope1Interceptor.getGraphNode(consumer);
      const scope2ConsumerNode = scope2Interceptor.getGraphNode(consumer);

      expect(scope1ConsumerNode?.children).toEqual([sharedDefNode]);
      expect(scope2ConsumerNode?.children).toEqual([sharedDefNode]);
    });

    it(`works with cascading`, async () => {
      const shared = fn.singleton(() => 1);
      const consumer = fn.scoped(use => ({ c: use(shared), value: 0 }));

      const { cnt } = setup(c => {
        c.bindCascading(consumer).to(fn.scoped(use => ({ c: use(shared), value: 1 })));
      });

      const rootInterceptor = cnt.getInterceptor('graph') as Root<any>;
      const scope1 = cnt.scope();
      const scope2 = cnt.scope();

      expect(scope1.use(consumer)).toEqual({ c: 1, value: 1 });
      expect(scope2.use(consumer)).toEqual({ c: 1, value: 1 });
      expect(scope1.use(consumer)).toBe(scope2.use(consumer));

      const scope1Interceptor = scope1.getInterceptor('graph') as Node<any>;
      expect(scope1Interceptor.getGraphNode(consumer)?.value).toEqual({ c: 1, value: 1 });

      const scope2Interceptor = scope2.getInterceptor('graph') as Node<any>;
      expect(scope2Interceptor.getGraphNode(consumer)?.value).toEqual({ c: 1, value: 1 });

      expect(rootInterceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));

      // expect(rootInterceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));

      // expect(scope1Interceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
    });
  });
});
