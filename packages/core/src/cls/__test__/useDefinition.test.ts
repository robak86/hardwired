import { useDefinition } from '../useDefinition';
import { singleton } from '../../strategies/SingletonStrategy';
import { unit } from '../../module/ModuleBuilder';
import { withContainer } from '../withContainer';
import { request } from '../../strategies/RequestStrategy';

describe(`useDefinition`, () => {
  describe(`instantiating dependencies`, () => {
    const m1 = unit()
      .define('val1', singleton, () => 'val1')
      .define('val2', singleton, () => 'val2')
      .compile();

    it(`gets dependency from the module`, async () => {
      const wrapper = withContainer(() => useDefinition(m1, 'val1'));
      expect(wrapper).toEqual('val1');
    });
  });

  describe(`binding transient dependencies to component instance`, () => {
    class TestClass {
      public id = Math.random();

      constructor() {}
    }

    const m1 = unit()
      .define('cls', request, () => new TestClass())
      .compile();

    it.skip(`reuses the same transient instance for component rerender`, async () => {
      withContainer(() => {
        const result1 = withContainer(() => [useDefinition(m1, 'cls'), useDefinition(m1, 'cls')]);
        expect(result1[0]).not.toEqual(result1[1]);

        const result2 = withContainer(() => [useDefinition(m1, 'cls'), useDefinition(m1, 'cls')]);

        expect(result2[0]).not.toEqual(result2[1]);
        expect(result1[0]).toEqual(result2[0]);
        expect(result1[1]).toEqual(result2[1]);
      });
    });
  });
});
