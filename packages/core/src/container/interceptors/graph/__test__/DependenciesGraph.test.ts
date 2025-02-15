import {container} from '../../../Container.js';
import {fn} from '../../../../definitions/definitions.js';
import {DependenciesGraphRoot} from '../DependenciesGraph.js';

// TODO:
// - what should happen with transient definitions? they will be overridden in the situation where multiple singleton/scoped definitions create a transient definition for themselves!!!!
// - ok it's solved - we don't register transient definitions in the graph root. We allow only fetching singletons and scoped instances

/*

Maybe interceptors should be registered only in the root and be available directory from the container? 

const cnt = container.new({interceptors: {
  react: new ReactLifecycleInterceptor(),
}}); and this creates Container<{react: ReactLifecycleInterceptor}> and the interceptor is available directly from the container

cnt.getInterceptor('react').getGraphNode(a)

this will hide elegantly the details related to instantiating new interceptors for the child scopes.

on the other hand, one would like to have more control. E.g. disable any interceptor in prod
also object doesn't guarantee the order of execution of interceptors.

 */

// TODO:
//   - interceptor might not work with situations where it is registered in some child scope, because some definitions
//      might be already registered and we will miss them
//   - apart from the graph interceptor, create an interceptor that collects dependencies based on some matchFn
//   - create composite interceptor that will allow combining interceptors
//   - consider registering interceptors in the root configure function ONLY! - won't work with child scopes. See the first point
//   - narrow down the supported LifeTimes for react 'use' hook. Only 'singleton' and 'scoped' should be supported if we wanna support lifecycle callbacks

//   - how does interceptor work with scopes?!?!?!?!?

/* TODO: integrate interceptors with scopes!!!!!!!!
rootScope + rootInterceptor -> Create singletons A, B and scoped C, D that use A and B

childScope + new root interceptor -> Recreate scoped C, D for the child scope. The interceptor should have also the entries for A and B!!!!!!!!!!!
 */
// root Interceptors need to have a method child() that will create interceptor that inherits only singleton definitions from the parent interceptor
// graph interceptor should throw if scoped or singleton definition is being overridden!
// hold nodes in two maps: for singletons and for scoped definitions and for transients.
// what should happen with transient definitions? they will be overriden in the situation where multiple singleton/scoped definitions create a transient definition for themselves!!!!

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

      expect(interceptor.getGraphNode(a).value).toEqual({ A: { B: { c1: 'C1', c2: 'C2' } } });
      expect(interceptor.getGraphNode(b).value).toEqual({ B: { c1: 'C1', c2: 'C2' } });
      expect(interceptor.getGraphNode(b).descendants).toEqual(['C1', 'C2']);

      expect(interceptor.getGraphNode(a).definition).toBe(a);
      expect(interceptor.getGraphNode(b).definition).toBe(b);
      expect(interceptor.getGraphNode(c1).definition).toBe(c1);
      expect(interceptor.getGraphNode(c2).definition).toBe(c2);
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

        expect(interceptor.getGraphNode(a).value).toEqual({ A: { B: { c1: 'C1', c2: 'C2' } } });
        expect(interceptor.getGraphNode(b).value).toEqual({ B: { c1: 'C1', c2: 'C2' } });
        expect(interceptor.getGraphNode(b).descendants).toEqual(['C1', 'C2']);

        expect(interceptor.getGraphNode(a).definition).toBe(a);
        expect(interceptor.getGraphNode(b).definition).toBe(b);
        expect(interceptor.getGraphNode(c1).definition).toBe(c1);
        expect(interceptor.getGraphNode(c2).definition).toBe(c2);
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

        expect(interceptor.getGraphNode(a).value).toEqual({ A: 1 });
        expect(interceptor.getGraphNode(b).value).toEqual({ B: 2 });

        // keeps the last value, which is confusing, therefore getting transient definitions is forbidden on the type level
        // @ts-expect-error cannot access transient definitions
        expect(interceptor.getGraphNode(shared).value).toEqual(2);
      });
    });
  });
});
