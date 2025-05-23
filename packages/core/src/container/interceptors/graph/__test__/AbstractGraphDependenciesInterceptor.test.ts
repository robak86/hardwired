import { container } from '../../../Container.js';
import type { ContainerConfigureFn } from '../../../../configuration/ContainerConfiguration.js';
import { AbstractGraphDependenciesInterceptor } from '../AbstractGraphDependenciesInterceptor.js';
import type { IDefinitionToken } from '../../../../definitions/def-symbol.js';
import { cascading, scoped, singleton } from '../../../../definitions/def-symbol.js';
import { BoxedValue } from '../../../../__test__/BoxedValue.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import { COWMap } from '../../../../context/COWMap.js';

describe(`AbstractGraphDependenciesInterceptor`, () => {
  class SomeNode<T> {
    readonly id = Math.random();

    constructor(
      readonly value: T,
      readonly definition: IDefinitionToken<T, any>,
      readonly children: SomeNode<unknown>[],
    ) {}
  }

  class RootTestInterceptor extends AbstractGraphDependenciesInterceptor<SomeNode<unknown>> {
    static create() {
      return new RootTestInterceptor(new Map(), new Map(), COWMap.create());
    }

    getGraphNode<TInstance>(token: IDefinitionToken<TInstance, LifeTime>): SomeNode<TInstance> {
      const node = this.find(token);

      if (!node) {
        throw new Error(`Graph Node for token ${token.toString()} not found`);
      }

      return node as SomeNode<TInstance>;
    }

    onScope(): RootTestInterceptor {
      return new RootTestInterceptor(this._globalInstances, new Map(), this._cascadingInstances.clone());
    }

    protected buildGraphNode<TInstance>(
      instance: TInstance,
      token: IDefinitionToken<TInstance, LifeTime>,
      children: SomeNode<any>[],
    ): SomeNode<TInstance> {
      return new SomeNode(instance, token, children);
    }
  }

  function setup(...setupFns: ContainerConfigureFn[]) {
    const cnt = container.new(
      c => {
        c.withInterceptor(RootTestInterceptor);
      },
      ...setupFns,
    );
    const interceptor = cnt.getInterceptor(RootTestInterceptor);

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
        const def = scoped<number>('def');

        const { cnt } = setup(c => {
          c.add(def).fn(() => 1);
        });

        const rootValue = await cnt.use(def);

        expect(rootValue).toEqual(1);

        const childScope = cnt.scope(c => {
          return c.modify(def).static(123);
        });

        await childScope.use(def); // memoize scoped in the child container and child interceptor

        const rootInterceptor = cnt.getInterceptor(RootTestInterceptor);
        const childInterceptor = childScope.getInterceptor(RootTestInterceptor);

        expect(rootInterceptor.getGraphNode(def).value).toEqual(1);

        expect(childInterceptor.getGraphNode(def).value).toEqual(123);
      });

      it(`has correct children`, async () => {
        const shared = singleton<number>();
        const consumer = scoped<{ c: number }>();

        const { cnt } = setup(c => {
          c.add(shared).fn(() => 1);
          c.add(consumer).fn(val => ({ c: val }), shared);
        });

        const rootInterceptor = cnt.getInterceptor(RootTestInterceptor);

        const scope1 = cnt.scope();
        const scope1Interceptor = scope1.getInterceptor(RootTestInterceptor);

        const scope2 = cnt.scope();
        const scope2Interceptor = scope2.getInterceptor(RootTestInterceptor);

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

        const rootInterceptor = cnt.getInterceptor(RootTestInterceptor);
        const scope1 = cnt.scope();
        const scope2 = cnt.scope();

        expect(scope1.use(consumer)).toEqual({ c: 1, value: 1 });
        expect(scope2.use(consumer)).toEqual({ c: 1, value: 1 });
        expect(scope1.use(consumer)).toBe(scope2.use(consumer));
        expect(cnt.use(consumer)).toBe(scope1.use(consumer));

        const scope1Interceptor = scope1.getInterceptor(RootTestInterceptor);
        const scope2Interceptor = scope2.getInterceptor(RootTestInterceptor);

        expect(scope1Interceptor.getGraphNode(consumer).value).toEqual({ c: 1, value: 1 });
        expect(scope2Interceptor.getGraphNode(consumer).value).toEqual({ c: 1, value: 1 });

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));
        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
        expect(scope1Interceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
      });
    });
  });

  describe(`async`, () => {
    describe(`getNode`, () => {
      it(`caches node instances`, async () => {
        const def = singleton<number>();

        const { cnt, interceptor } = setup(c => {
          c.add(def).static(1);
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
          c.add(def).static(1);
        });

        const childScope = cnt.scope();

        await childScope.use(def);

        const node = interceptor.getGraphNode(def);

        expect(node?.value).toBe(1);
      });

      it(`doesn't propagate scoped definitions`, async () => {
        const def = scoped<number>();

        const { cnt } = setup(c => {
          c.add(def).static(1);
        });

        const rootValue = await cnt.use(def);

        expect(rootValue).toEqual(1);

        const childScope = await cnt.scope(async c => {
          return c.modify(def).static(123);
        });

        const rootInterceptor = cnt.getInterceptor(RootTestInterceptor);
        const childInterceptor = childScope.getInterceptor(RootTestInterceptor);

        await childScope.use(def); // memoize scoped in the child container and child interceptor

        expect(childInterceptor.getGraphNode(def).value).toEqual(123);
        expect(rootInterceptor.getGraphNode(def).value).toEqual(1);
      });

      it(`has correct children`, async () => {
        const shared = singleton<number>();
        const consumer = scoped<{ c: number }>();

        const { cnt } = setup(c => {
          c.add(shared).fn(() => 1);
          c.add(consumer).fn(val => ({ c: val }), shared);
        });

        const rootInterceptor = cnt.getInterceptor(RootTestInterceptor);

        const scope1 = cnt.scope();
        const scope1Interceptor = scope1.getInterceptor(RootTestInterceptor);

        const scope2 = cnt.scope();
        const scope2Interceptor = scope2.getInterceptor(RootTestInterceptor);

        await scope1.use(consumer);
        await scope2.use(consumer);

        const sharedDefNode = rootInterceptor.getGraphNode(shared);

        const scope1ConsumerNode = scope1Interceptor.getGraphNode(consumer);
        const scope2ConsumerNode = scope2Interceptor.getGraphNode(consumer);

        expect(scope1ConsumerNode.children).toEqual([sharedDefNode]);
        expect(scope2ConsumerNode.children).toEqual([sharedDefNode]);
      });

      it(`works with cascading definitions`, async () => {
        const shared = singleton<number>();
        const consumer = cascading<{ c: number; value: number }>();

        const { cnt } = setup(c => {
          c.add(shared).fn(() => 1);
          c.add(consumer).fn(val => ({ c: val, value: 1 }), shared);
        });

        const rootInterceptor = cnt.getInterceptor(RootTestInterceptor);
        const scope1 = cnt.scope();
        const scope2 = cnt.scope();

        expect(await scope1.use(consumer)).toEqual({ c: 1, value: 1 });
        expect(await scope2.use(consumer)).toEqual({ c: 1, value: 1 });
        expect(await scope1.use(consumer)).toBe(await scope2.use(consumer));
        expect(await cnt.use(consumer)).toBe(await scope1.use(consumer));

        const scope1Interceptor = scope1.getInterceptor(RootTestInterceptor);

        expect(scope1Interceptor.getGraphNode(consumer)?.value).toEqual({ c: 1, value: 1 });

        const scope2Interceptor = scope2.getInterceptor(RootTestInterceptor);

        expect(scope2Interceptor.getGraphNode(consumer)?.value).toEqual({ c: 1, value: 1 });

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
        expect(scope1Interceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
      });

      it(`works with cascade`, async () => {
        const shared = singleton<number>();
        const consumer = cascading<{ c: number; value: number }>();

        const { cnt } = setup(c => {
          c.add(shared).fn(() => 1);
          c.add(consumer).fn(val => ({ c: val, value: 1 }), shared);
        });

        const rootInterceptor = cnt.getInterceptor(RootTestInterceptor);
        const scope1 = cnt.scope();
        const scope2 = scope1.scope();
        const scope3 = scope2.scope(s => s.modify(consumer).claimNew());

        const scope3Consumer = await scope3.use(consumer);
        const scope2Consumer = await scope2.use(consumer);

        expect(scope3Consumer).not.toBe(scope2Consumer);
        expect(await scope1.use(consumer)).toBe(await scope2.use(consumer));
        expect(await cnt.use(consumer)).toBe(await scope1.use(consumer));

        const scope1Interceptor = scope1.getInterceptor(RootTestInterceptor);
        const scope2Interceptor = scope2.getInterceptor(RootTestInterceptor);
        const scope3Interceptor = scope3.getInterceptor(RootTestInterceptor);

        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));
        expect(rootInterceptor.getGraphNode(consumer)).toBe(scope2Interceptor.getGraphNode(consumer));
        expect(scope2Interceptor.getGraphNode(consumer)).toBe(scope1Interceptor.getGraphNode(consumer));

        const scope3node = scope3Interceptor.getGraphNode(consumer);
        const scope2Node = scope2Interceptor.getGraphNode(consumer);

        expect(scope3node).not.toBe(scope2Node);
      });

      it(`works with cascading modify`, async () => {
        const cascadingDef = cascading<BoxedValue<number>>();

        const { cnt } = setup(c => {
          c.add(cascadingDef).fn(() => new BoxedValue(1));
        });

        const scope1 = cnt.scope(c => c.modify(cascadingDef).claimNew());

        const rootInstance = await cnt.use(cascadingDef);
        const childInstance = await scope1.use(cascadingDef);

        expect(rootInstance).not.toBe(childInstance);

        const rootInterceptor = cnt.getInterceptor(RootTestInterceptor);
        const scope1Interceptor = scope1.getInterceptor(RootTestInterceptor);

        expect(rootInterceptor.getGraphNode(cascadingDef)).not.toBe(scope1Interceptor.getGraphNode(cascadingDef));
      });
    });
  });
});
