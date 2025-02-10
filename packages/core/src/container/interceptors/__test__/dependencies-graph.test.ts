import { Container } from '../../Container.js';
import { BindingsRegistry } from '../../../context/BindingsRegistry.js';
import { InstancesStore } from '../../../context/InstancesStore.js';
import { fn } from '../../../definitions/definitions.js';
import { DependenciesGraphRoot } from '../dependencies-graph.js';

describe(`DependenciesGraph`, () => {
  function setup() {
    const interceptor = new DependenciesGraphRoot();
    const cnt = new Container(null, BindingsRegistry.create(), InstancesStore.create()).withInterceptor(interceptor);

    const c1 = fn.singleton(use => 'C1');
    const c2 = fn.singleton(use => 'C2');
    const b = fn.singleton(use => ({ B: { c1: use(c1), c2: use(c2) } }));
    const a = fn.singleton(use => ({ A: use(b) }));

    return { interceptor, cnt, a, b, c1, c2 };
  }

  describe(`sync`, () => {
    it(`Calls interceptor methods with correct arguments`, () => {
      const { interceptor, cnt, a } = setup();
      cnt.use(a);

      console.log(interceptor.getDescendants(a));
    });
  });

  describe(`getGraphNode`, () => {
    it(`returns node holding corresponding value`, async () => {
      const { interceptor, cnt, a, b } = setup();

      cnt.use(a);

      expect(interceptor.getGraphNode(a).value).toEqual({ A: { B: { c1: 'C1', c2: 'C2' } } });
      expect(interceptor.getGraphNode(b).value).toEqual({ B: { c1: 'C1', c2: 'C2' } });
    });
  });
});
