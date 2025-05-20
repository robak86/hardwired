import { container } from '../../../Container.js';
import type { ContainerConfigureFn } from '../../../../configuration/ContainerConfiguration.js';
import type { GraphNode } from '../GraphBuilderInterceptor.js';
import { GraphBuilderInterceptor } from '../GraphBuilderInterceptor.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import { cascading, scoped, singleton } from '../../../../definitions/def-symbol.js';

describe(`GraphBuildInterceptor`, () => {
  class SomeNode<T> implements GraphNode<T> {
    readonly id = Math.random();

    constructor(
      readonly value: T,
      readonly definition: IDefinition<T, any>,
      readonly children: GraphNode<any>[],
    ) {}
  }

  class TestInterceptor extends GraphBuilderInterceptor<any, SomeNode<any>> {
    constructor() {
      super({
        createNode(definition, value, children) {
          return new SomeNode(value, definition, children);
        },
      });
    }
  }

  function setup(...setupFns: ContainerConfigureFn[]) {
    const cnt = container.new(
      c => {
        const graphBuildInterceptor = new TestInterceptor();

        c.withInterceptor('graph', graphBuildInterceptor);
      },
      ...setupFns,
    );
    const interceptor = cnt.getInterceptor('graph') as TestInterceptor;

    return { cnt, interceptor };
  }

  describe(`sync`, () => {
    describe(`getNode`, () => {
      it(`caches node instances`, async () => {
        const def = singleton<number>();

        const { cnt, interceptor } = setup(c => {
          c.add(def).fn(() => 1);
        });

        await cnt.use(def);

        const nodeReq1 = interceptor.getGraphNode(def);

        expect(nodeReq1?.value).toBe(1);

        await cnt.use(def);

        const nodeReq2 = interceptor.getGraphNode(def);

        expect(nodeReq2).toBe(nodeReq1);
      });
    });

    describe(`scopes`, () => {
      it('propagates singletons to the root', async () => {
        const def = singleton<number>();

        const { cnt, interceptor } = setup(c => {
          c.add(def).fn(() => 1);
        });

        const childScope = cnt.scope();

        await childScope.use(def);

        const node = interceptor.getGraphNode(def);

        expect(node?.value).toBe(1);
      });

      it(`doesn't propagate scoped definitions`, async () => {
        const def = scoped<number>();

        const { cnt, interceptor } = setup(c => {
          c.add(def).fn(() => 1);
        });

        const rootValue = await cnt.use(def);

        expect(rootValue).toEqual(1);

        const childScope = cnt.scope(c => {
          return c.override(def).static(123);
        });

        const rootInterceptor = cnt.getInterceptor('graph') as TestInterceptor;
        const childInterceptor = childScope.getInterceptor('graph') as TestInterceptor;

        await childScope.use(def); // memoize scoped in the child container and child interceptor

        expect(childInterceptor.getGraphNode(def)?.value).toEqual(123);
        expect(rootInterceptor.getGraphNode(def)?.value).toEqual(1);
      });

      it(`has correct children`, async () => {
        const shared = singleton<number>();
        const consumer = scoped<{ c: number }>();

        const { cnt } = setup(c => {
          c.add(shared).fn(() => 1);
          c.add(consumer).fn(val => ({ c: val }), shared);
        });

        const rootInterceptor = cnt.getInterceptor('graph') as TestInterceptor;

        const scope1 = cnt.scope();
        const scope1Interceptor = scope1.getInterceptor('graph') as TestInterceptor;

        const scope2 = cnt.scope();
        const scope2Interceptor = scope2.getInterceptor('graph') as TestInterceptor;

        await scope1.use(consumer);
        await scope2.use(consumer);

        const sharedDefNode = rootInterceptor.getGraphNode(shared);

        const scope1ConsumerNode = scope1Interceptor.getGraphNode(consumer);
        const scope2ConsumerNode = scope2Interceptor.getGraphNode(consumer);

        expect(scope1ConsumerNode?.children).toEqual([sharedDefNode]);
        expect(scope2ConsumerNode?.children).toEqual([sharedDefNode]);
      });

      it(`works with cascading`, async () => {
        const shared = singleton<number>();
        const consumer = cascading<{ c: number; value: number }>();

        const { cnt } = setup(c => {
          c.add(shared).fn(() => 1);
          c.add(consumer).fn(val => ({ c: val, value: 1 }), shared);
        });

        const rootInterceptor = cnt.getInterceptor('graph') as TestInterceptor;
        const scope1 = cnt.scope();
        const scope2 = cnt.scope();

        expect(scope1.use(consumer)).toEqual({ c: 1, value: 1 });
        expect(scope2.use(consumer)).toEqual({ c: 1, value: 1 });
        expect(scope1.use(consumer)).toBe(scope2.use(consumer));
        expect(cnt.use(consumer)).toBe(scope1.use(consumer));

        const scope1Interceptor = scope1.getInterceptor('graph') as TestInterceptor;

        expect(scope1Interceptor.getGraphNode(consumer)?.value).toEqual({ c: 1, value: 1 });

        const scope2Interceptor = scope2.getInterceptor('graph') as TestInterceptor;

        expect(scope2Interceptor.getGraphNode(consumer)?.value).toEqual({ c: 1, value: 1 });

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
        expect(scope1Interceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
      });
    });
  });

  describe(`async`, () => {
    describe(`getNode`, () => {
      it(`caches node instances`, async () => {
        const { cnt, interceptor } = setup();
        const def = fn.singleton(async () => 1);

        await cnt.use(def);

        const nodeReq1 = interceptor.getGraphNode(def);

        expect(nodeReq1?.value).toBe(1);

        await cnt.use(def);
        const nodeReq2 = interceptor.getGraphNode(def);

        expect(nodeReq2).toBe(nodeReq1);
      });
    });

    describe(`scopes`, () => {
      it('propagates singletons to the root', async () => {
        const { cnt, interceptor } = setup();
        const def = fn.singleton(async () => 1);

        const childScope = cnt.scope();

        await childScope.use(def);

        const node = interceptor.getGraphNode(def);

        expect(node?.value).toBe(1);
      });

      it(`doesn't propagate scoped definitions`, async () => {
        const { cnt } = setup();
        const def = fn.scoped(async () => 1);

        const rootValue = await cnt.use(def);

        expect(rootValue).toEqual(1);

        const childScope = await cnt.scope(async c => {
          return c.override(def).toValue(123);
        });

        const rootInterceptor = cnt.getInterceptor('graph') as TestInterceptor;
        const childInterceptor = childScope.getInterceptor('graph') as TestInterceptor;

        await childScope.use(def); // memoize scoped in the child container and child interceptor

        expect(childInterceptor.getGraphNode(def)?.value).toEqual(123);
        expect(rootInterceptor.getGraphNode(def)?.value).toEqual(1);
      });

      it(`has correct children`, async () => {
        const { cnt } = setup();
        const shared = fn.singleton(async () => 1);
        const consumer = fn.scoped(async use => ({ c: await use(shared) }));

        const rootInterceptor = cnt.getInterceptor('graph') as TestInterceptor;

        const scope1 = cnt.scope();
        const scope1Interceptor = scope1.getInterceptor('graph') as TestInterceptor;

        const scope2 = cnt.scope();
        const scope2Interceptor = scope2.getInterceptor('graph') as TestInterceptor;

        await scope1.use(consumer);
        await scope2.use(consumer);

        const sharedDefNode = rootInterceptor.getGraphNode(shared);

        const scope1ConsumerNode = scope1Interceptor.getGraphNode(consumer);
        const scope2ConsumerNode = scope2Interceptor.getGraphNode(consumer);

        expect(scope1ConsumerNode?.children).toEqual([sharedDefNode]);
        expect(scope2ConsumerNode?.children).toEqual([sharedDefNode]);
      });

      it(`works with overrideCascading`, async () => {
        const shared = fn.singleton(async () => 1);
        const consumer = fn.scoped(async use => ({ c: await use(shared), value: 0 }));

        const { cnt } = setup(c => {
          c.overrideCascading(consumer).to(fn.scoped(async use => ({ c: await use(shared), value: 1 })));
        });

        const rootInterceptor = cnt.getInterceptor('graph') as TestInterceptor;
        const scope1 = cnt.scope();
        const scope2 = cnt.scope();

        expect(await scope1.use(consumer)).toEqual({ c: 1, value: 1 });
        expect(await scope2.use(consumer)).toEqual({ c: 1, value: 1 });
        expect(await scope1.use(consumer)).toBe(await scope2.use(consumer));
        expect(await cnt.use(consumer)).toBe(await scope1.use(consumer));

        const scope1Interceptor = scope1.getInterceptor('graph') as TestInterceptor;

        expect(scope1Interceptor.getGraphNode(consumer)?.value).toEqual({ c: 1, value: 1 });

        const scope2Interceptor = scope2.getInterceptor('graph') as TestInterceptor;

        expect(scope2Interceptor.getGraphNode(consumer)?.value).toEqual({ c: 1, value: 1 });

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
        expect(scope1Interceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
      });

      it(`works with cascade`, async () => {
        const shared = fn.singleton(async () => 1);
        const consumer = fn.scoped(async use => ({ c: await use(shared), value: Math.random() }));

        const { cnt } = setup(c => {
          c.cascade(consumer);
        });

        const rootInterceptor = cnt.getInterceptor('graph') as TestInterceptor;
        const scope1 = cnt.scope();
        const scope2 = cnt.scope();

        expect(await scope1.use(consumer)).toBe(await scope2.use(consumer));
        expect(await cnt.use(consumer)).toBe(await scope1.use(consumer));

        const scope1Interceptor = scope1.getInterceptor('graph') as TestInterceptor;
        const scope2Interceptor = scope2.getInterceptor('graph') as TestInterceptor;

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));
        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
        expect(scope2Interceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));
      });
    });
  });
});
