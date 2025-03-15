import { container } from '../../../Container.js';
import { fn } from '../../../../definitions/fn.js';
import { DependenciesGraphRoot } from '../DependenciesGraph.js';

describe(`DependenciesGraph`, () => {
  function setup() {
    const interceptor = new DependenciesGraphRoot();

    const cnt = container.new(c => c.withInterceptor('graph', interceptor));

    cnt.getInterceptor('graph');

    const c1 = fn.singleton(use => 'C1');
    const c2 = fn.singleton(use => 'C2');
    const b = fn.singleton(use => ({ B: { c1: use(c1), c2: use(c2) } }));
    const a = fn.singleton(use => ({ A: use(b) }));

    return { interceptor, cnt, a, b, c1, c2 };
  }

  describe(`getGraphNode`, () => {
    it(`returns node holding corresponding value`, async () => {
      const { cnt, a, b, c1, c2 } = setup();

      cnt.use(a);

      const interceptor = cnt.getInterceptor('graph') as DependenciesGraphRoot;

      expect(interceptor.getGraphNode(a)?.value).toEqual({ A: { B: { c1: 'C1', c2: 'C2' } } });
      expect(interceptor.getGraphNode(b)?.value).toEqual({ B: { c1: 'C1', c2: 'C2' } });
      expect(interceptor.getGraphNode(b)?.descendants).toEqual(['C1', 'C2']);

      expect(interceptor.getGraphNode(a)?.definition).toBe(a);
      expect(interceptor.getGraphNode(b)?.definition).toBe(b);
      expect(interceptor.getGraphNode(c1)?.definition).toBe(c1);
      expect(interceptor.getGraphNode(c2)?.definition).toBe(c2);
    });
  });

  describe(`async`, () => {
    function setup() {
      const interceptor = new DependenciesGraphRoot();

      const cnt = container.new(c => c.withInterceptor('graph', interceptor));

      cnt.getInterceptor('graph');

      const c1 = fn.singleton(async use => 'C1');
      const c2 = fn.singleton(async use => 'C2');
      const b = fn.singleton(async use => ({ B: { c1: await use(c1), c2: await use(c2) } }));
      const a = fn.singleton(async use => ({ A: await use(b) }));

      return { interceptor, cnt, a, b, c1, c2 };
    }

    describe(`getGraphNode`, () => {
      it(`returns node holding corresponding value`, async () => {
        const { cnt, a, b, c1, c2 } = setup();

        await cnt.use(a);

        const interceptor = cnt.getInterceptor('graph') as DependenciesGraphRoot;

        expect(interceptor.getGraphNode(a)?.value).toEqual({ A: { B: { c1: 'C1', c2: 'C2' } } });
        expect(interceptor.getGraphNode(b)?.value).toEqual({ B: { c1: 'C1', c2: 'C2' } });
        expect(interceptor.getGraphNode(b)?.descendants).toEqual(['C1', 'C2']);

        expect(interceptor.getGraphNode(a)?.definition).toBe(a);
        expect(interceptor.getGraphNode(b)?.definition).toBe(b);
        expect(interceptor.getGraphNode(c1)?.definition).toBe(c1);
        expect(interceptor.getGraphNode(c2)?.definition).toBe(c2);
      });
    });

    describe(`definition referenced by two others`, () => {
      it(`returns node holding corresponding value`, async () => {
        const { cnt } = setup();

        let counter = 0;
        const shared = fn(async use => (counter += 1));
        const a = fn.singleton(async use => ({ A: await use(shared) }));
        const b = fn.singleton(async use => ({ B: await use(shared) }));

        await cnt.use(a);
        await cnt.use(b);

        const interceptor = cnt.getInterceptor('graph') as DependenciesGraphRoot;

        expect(interceptor.getGraphNode(a)?.value).toEqual({ A: 1 });
        expect(interceptor.getGraphNode(b)?.value).toEqual({ B: 2 });

        // keeps the last value, which is confusing, therefore getting transient definitions is forbidden on the type level
        // @ts-expect-error cannot access transient definitions
        expect(interceptor.getGraphNode(shared))?.toEqual(undefined); // we don't register transient definitions in the graph root
      });
    });
  });
});
