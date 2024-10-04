import {
  DisposableAsyncScopeConfigureFn,
  DisposableScopeConfigureFn,
} from '../configuration/DisposableScopeConfiguration.js';
import { container } from '../container/Container.js';
import { DisposableScope } from '../container/DisposableScope.js';
import { composeAsync } from '../configuration/helper/compose.js';

export type TestRunnerCallbacks = {
  beforeEach: (fn: () => Promise<void>) => void;
  afterEach: (fn: () => void) => void;
};

export const withTestContainer =
  (config: TestRunnerCallbacks) =>
  (...configureFn: Array<DisposableScopeConfigureFn | DisposableAsyncScopeConfigureFn>): DisposableScope => {
    const testContainer = container.new();
    let disposable: DisposableScope;

    config.beforeEach(async () => {
      disposable = await testContainer.disposable(composeAsync(...configureFn));
    });

    config.afterEach(() => {
      disposable.dispose();
    });

    return new Proxy(
      () => {
        throw new Error('');
      },
      {
        apply: (target, thisArg, argumentsList) => {
          return disposable.use(...(argumentsList as [any]));
        },
        get: (_, prop: keyof DisposableScope) => {
          return disposable[prop];
        },
        set: (_, prop: keyof DisposableScope, value) => {
          throw new Error(`Cannot set property`);
        },
      },
    ) as any;
  };
