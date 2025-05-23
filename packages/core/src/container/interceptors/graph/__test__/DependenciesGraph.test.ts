import { DependenciesGraphInterceptor } from '../DependenciesGraph.js';
import { scoped, singleton, transient } from '../../../../definitions/def-symbol.js';
import { container } from '../../../Container.js';
import type { ContainerConfigureFn } from '../../../../configuration/ContainerConfiguration.js';

describe(`DependenciesGraph`, () => {
  function setup() {
    const c1Def = singleton<string>();
    const c2Def = singleton<string>();
    const bDef = singleton<{ B: { c1: string; c2: string } }>();
    const aDef = singleton<{ A: { B: { c1: string; c2: string } } }>();

    const cnt = container.new(c => {
      c.add(c1Def).fn(() => 'C1');
      c.add(c2Def).fn(() => 'C2');
      c.add(bDef).fn((c1, c2) => ({ B: { c1, c2 } }), c1Def, c2Def);
      c.add(aDef).fn(b => ({ A: b }), bDef);

      c.withInterceptor(DependenciesGraphInterceptor);
    });

    return { cnt, a: aDef, b: bDef, c1: c1Def, c2: c2Def };
  }

  describe(`getGraphNode`, () => {
    it(`returns node holding corresponding value`, async () => {
      const { cnt, a, b, c1, c2 } = setup();

      await cnt.use(a);

      const interceptor = cnt.getInterceptor(DependenciesGraphInterceptor);

      expect(interceptor.getGraphNode(a).value).toEqual({ A: { B: { c1: 'C1', c2: 'C2' } } });
      expect(interceptor.getGraphNode(b).value).toEqual({ B: { c1: 'C1', c2: 'C2' } });
      expect(interceptor.getGraphNode(b).descendants).toEqual(['C1', 'C2']);

      expect(interceptor.getGraphNode(a).token).toBe(a);
      expect(interceptor.getGraphNode(b).token).toBe(b);
      expect(interceptor.getGraphNode(c1).token).toBe(c1);
      expect(interceptor.getGraphNode(c2).token).toBe(c2);
    });
  });

  describe(`async`, () => {
    function setup(...configureFns: ContainerConfigureFn[]) {
      const c1Def = singleton<string>();
      const c2Def = singleton<string>();
      const bDef = singleton<{ B: { c1: string; c2: string } }>();
      const aDef = singleton<{ A: { B: { c1: string; c2: string } } }>();

      const cnt = container.new(
        c => {
          c.add(c1Def).fn(async () => 'C1');
          c.add(c2Def).fn(async () => 'C2');
          c.add(bDef).fn(async (c1, c2) => ({ B: { c1, c2 } }), c1Def, c2Def);
          c.add(aDef).fn(async b => ({ A: b }), bDef);

          c.withInterceptor(DependenciesGraphInterceptor);
        },
        ...configureFns,
      );

      return { cnt, a: aDef, b: bDef, c1: c1Def, c2: c2Def };
    }

    describe(`getGraphNode`, () => {
      it(`returns node holding corresponding value`, async () => {
        const { cnt, a, b, c1, c2 } = setup();

        await cnt.use(a);

        const interceptor = cnt.getInterceptor(DependenciesGraphInterceptor);

        expect(interceptor.getGraphNode(a)?.value).toEqual({ A: { B: { c1: 'C1', c2: 'C2' } } });
        expect(interceptor.getGraphNode(b)?.value).toEqual({ B: { c1: 'C1', c2: 'C2' } });
        expect(interceptor.getGraphNode(b)?.descendants).toEqual(['C1', 'C2']);

        expect(interceptor.getGraphNode(a)?.token).toBe(a);
        expect(interceptor.getGraphNode(b)?.token).toBe(b);
        expect(interceptor.getGraphNode(c1)?.token).toBe(c1);
        expect(interceptor.getGraphNode(c2)?.token).toBe(c2);
      });
    });

    describe(`definition referenced by two others`, () => {
      it(`returns node holding corresponding value`, async () => {
        let counter = 0;

        const shared = singleton<number>();
        const a = scoped<{ A: number }>();
        const b = scoped<{ B: number }>();
        const c = transient<{ C: number }>();

        const { cnt } = setup(config => {
          config.add(shared).fn(async () => (counter += 1));

          config.add(a).fn(async val => ({ A: val }), shared);
          config.add(b).fn(async val => ({ B: val }), shared);
          config.add(c).fn(async val => ({ C: val }), shared);
        });

        await cnt.use(a);
        await cnt.use(b);

        const interceptor = cnt.getInterceptor(DependenciesGraphInterceptor);

        expect(interceptor.getGraphNode(a).value).toEqual({ A: 1 });
        expect(interceptor.getGraphNode(b).value).toEqual({ B: 1 });

        expect(() => {
          interceptor.getGraphNode(c);
        }).toThrowError(`Node for token ${c.toString()} not found`);
      });
    });
  });
});
