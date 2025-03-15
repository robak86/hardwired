import { fn } from '../fn.js';
import { once } from '../../container/Container.js';

describe(`FnDefinition`, () => {
  describe(`ad hoc instantiation`, () => {
    it(`returns an instance of the definition`, async () => {
      const def = fn.singleton(() => 123);

      const value = once(def);

      expect(value).toEqual(123);
    });
  });
});
