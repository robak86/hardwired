import { Container, container } from '../../container/Container.js';
import { fn } from '../../definitions/definitions.js';
import { configureScope } from '../ScopeConfiguration.js';

describe(`disposable`, () => {
  describe(`Disposing container`, () => {
    it(`calls dispose function with the container instance`, async () => {
      const disposeSpy = vi.fn();
      const def = fn.scoped(() => 'def');

      function run() {
        using cnt = container.new(scope => scope.onDispose(disposeSpy));
        cnt.use(def);
      }

      run();
      expect(disposeSpy).toHaveBeenCalledTimes(1);
      expect(disposeSpy).toHaveBeenCalledWith(expect.any(Container));
    });

    it(`disposes child scopes`, async () => {});
  });

  describe(`disposing scope`, () => {
    it(`calls dispose function with the container instance`, async () => {
      const disposeSpy = vi.fn();
      const def = fn.scoped(() => 'def');

      function run() {
        const cnt = container.new();
        using scope = cnt.checkoutScope(scope => scope.onDispose(disposeSpy));
        scope.use(def);
      }

      run();
      expect(disposeSpy).toHaveBeenCalledTimes(1);
      expect(disposeSpy).toHaveBeenCalledWith(expect.any(Container));
    });

    it(`disposes scope when it's accessed using withScope`, async () => {
      const disposeSpy = vi.fn();
      const def = fn.scoped(() => 'def');

      function run() {
        const cnt = container.new();
        const config = configureScope(scope => scope.onDispose(disposeSpy));
        cnt.withScope(config, use => {
          use(def);
        });
      }

      run();
      expect(disposeSpy).toHaveBeenCalledTimes(1);
      expect(disposeSpy).toHaveBeenCalledWith(expect.any(Container));
    });
  });
});
