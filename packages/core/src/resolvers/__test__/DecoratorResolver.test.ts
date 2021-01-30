import { value } from '../ValueResolver';
import { DecoratorResolver } from '../DecoratorResolver';

describe(`DecoratorResolver`, () => {
  describe(`it`, () => {
    it(`inherits the same id as decorated resolver`, async () => {
      const resolver1 = value(1);
      const decoratorResolver = new DecoratorResolver<any, any>(resolver1, val => val + 1);
      expect(decoratorResolver.id).toEqual(resolver1.id);
    });
  });
});
