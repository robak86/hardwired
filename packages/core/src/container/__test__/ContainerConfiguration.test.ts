import { describe } from 'vitest';
import { fn } from '../../definitions/definitions.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { container } from '../Container.js';

describe('ContainerConfiguration', () => {
  describe(`init`, () => {
    it(`runs init functions on passing the newly created container`, async () => {
      const dep = fn.scoped(() => new BoxedValue(Math.random()));

      const cnt = container.new(container => {
        container.init(use => {
          use(dep).value = 1;
        });
      });

      expect(cnt.use(dep).value).toEqual(1);
    });
  });
});
