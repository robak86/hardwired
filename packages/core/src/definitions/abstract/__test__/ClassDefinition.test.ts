import {cls} from "../../cls.js";

describe(`ClassDefinition`, () => {
  describe(`name`, () => {
    it(`returns class name`, async () => {
      class MyClass {}

      const def = cls.transient(MyClass);

      expect(def.name).toBe('MyClass');
    });
  });
});