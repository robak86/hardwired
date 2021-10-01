import { singleton } from '../../strategies/SingletonStrategyLegacy';
import { unit } from '../ModuleBuilder';
import { container } from '../../container/Container';

describe(`Module`, () => {
  describe(`pick`, () => {
    it(`returns dependency selector`, async () => {
      const m = unit()
        .def('val1', singleton, () => 1)
        .compile();

      const instance = container().select(m.pick('val1'));
      expect(instance).toEqual(1);
    });
  });
});
