import { DecoratorResolver } from '../DecoratorResolver';
import { singleton } from '../../strategies/SingletonStrategy';

describe(`DecoratorResolver`, () => {
  describe(`it`, () => {
    it(`inherits the same id as decorated resolver`, async () => {
      const resolver1 = singleton(() => 1);
      const decoratorResolver = new DecoratorResolver<any, any>(resolver1, val => val + 1);
      expect(decoratorResolver.id).toEqual(resolver1.id);
    });
  });
});
