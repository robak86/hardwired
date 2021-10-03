import { singleton } from '../factory/strategies';
import { container } from "../../container/Container";

describe(`AsyncSingletonStrategy`, () => {
  describe(`no dependencies`, () => {
    it(`returns correct value`, async () => {
      class NoArgsCls {
        value = Math.random();
      }

      const asyncDef = singleton.asyncClass(NoArgsCls);
      const result = await container().getAsync(asyncDef);
      expect(result).toBeInstanceOf(NoArgsCls)
    });
  });

  describe(`no dependencies`, () => {
    it(`returns correct value`, async () => {
      class NoArgsCls {
        value = Math.random();
      }

      const asyncDef = singleton.asyncClass(NoArgsCls);
      const result = await container().getAsync(asyncDef);
      expect(result).toBeInstanceOf(NoArgsCls)
    });
  });
});
