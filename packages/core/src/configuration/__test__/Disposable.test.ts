import { container } from '../../container/Container.js';
import { fn } from '../../definitions/definitions.js';
import { DisposableScope } from '../../container/DisposableScope.js';

describe(`disposable`, () => {
  describe(`disposing container`, () => {
    it(`is not supported`, async () => {
      try {
        container.new(scope => {
          // @ts-expect-error - no dispose function
          scope.onDispose();
        });
      } catch (err) {
        // noop
      }
    });
  });

  describe(`disposing scope`, () => {
    it(`is not supported`, async () => {
      try {
        container.new().scope(scope => {
          // @ts-expect-error - no dispose function
          return scope.onDispose();
        });
      } catch (err) {
        // noop
      }
    });
  });

  describe(`disposing disposable scope`, () => {
    it(`calls dispose function with the container instance`, async () => {
      const disposeSpy = vi.fn();
      const def = fn.scoped(() => 'def');

      function run() {
        const cnt = container.new();
        using scope = cnt.disposable(scope => scope.onDispose(disposeSpy));
        scope.use(def);
      }

      run();
      expect(disposeSpy).toHaveBeenCalledTimes(1);
      expect(disposeSpy).toHaveBeenCalledWith(expect.any(DisposableScope));
    });
  });
});
