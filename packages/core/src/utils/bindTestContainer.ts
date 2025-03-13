import type {
  DisposableAsyncScopeConfigureFn,
  DisposableScopeConfigureFn,
} from '../configuration/DisposableScopeConfiguration.js';
import type { DisposableScope } from '../container/DisposableScope.js';
import { composeAsync } from '../configuration/helper/compose.js';
import { container } from '../container/Container.js';
import type { AsyncContainerConfigureFn, ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';

export type BindTestContainerConfig = {
  beforeEach: (fn: () => Promise<void> | void) => void;
  afterEach: (fn: () => Promise<void> | void) => void;
  configure?: ContainerConfigureFn | AsyncContainerConfigureFn;
};

export const bindTestContainer = (config: BindTestContainerConfig) => {
  const testContainer = config.configure ? container.new(config.configure) : container.new();

  const withDisposableScope = (
    ...configureFn: Array<DisposableScopeConfigureFn | DisposableAsyncScopeConfigureFn>
  ): DisposableScope => {
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

  return Object.assign(withDisposableScope, {
    get container() {
      return testContainer;
    },
  });
};
