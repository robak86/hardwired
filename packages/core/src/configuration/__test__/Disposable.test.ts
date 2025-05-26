import { container } from '../../container/Container.js';

describe(`disposable`, () => {
  describe(`disposing container`, () => {
    it(`is not supported`, async () => {
      try {
        container(scope => {
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
        container().scope(scope => {
          // @ts-expect-error - no dispose function
          return scope.onDispose();
        });
      } catch (err) {
        // noop
      }
    });
  });
});
