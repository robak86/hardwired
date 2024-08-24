import { fn } from '../../definitions.js';

describe(`FnDefinition`, () => {
  describe(`ad hoc instantiation`, () => {
    it(`returns an instance of the definition`, async () => {
      const def = fn.singleton(() => 123);

      const value = def();

      expect(value).toEqual(123);
    });
  });
});
