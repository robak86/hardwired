import { describe } from 'vitest';
import { container } from '../../../container/Container.js';
import { fn } from '../../../definitions/definitions.js';
import { configureScope } from '../../ScopeConfiguration.js';
import { compose } from '../compose.js';
import { configureContainer } from '../../ContainerConfiguration.js';

describe('compose', async () => {
  describe('composing scope configurations', async () => {
    it('returns a function that applies all given scope configurations', async () => {
      const a = fn.scoped(() => 0);
      const b = fn.scoped(() => 0);

      const config1 = configureScope(scope => {
        scope.bindLocal(a).toValue(1);
      });

      const config2 = configureScope(scope => {
        scope.bindLocal(b).toValue(1);
      });

      const composed = compose(config1, config2);

      const root = container.new();

      const scoped = root.scope(composed);
      expect(scoped.use(a)).toBe(1);
      expect(scoped.use(b)).toBe(1);
    });
  });

  describe('composing container configurations', async () => {
    it('returns a function that applies all given scope configurations', async () => {
      const a = fn.scoped(() => 0);
      const b = fn.scoped(() => 0);

      const config1 = configureContainer(scope => {
        scope.bindLocal(a).toValue(1);
      });

      const config2 = configureContainer(scope => {
        scope.bindLocal(b).toValue(1);
      });

      const composed = compose(config1, config2);

      const root = container.new(composed);

      expect(root.use(a)).toBe(1);
      expect(root.use(b)).toBe(1);
    });
  });
});
