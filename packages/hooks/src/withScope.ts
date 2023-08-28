import { DefinitionOverride, useContainer, runWithContainer } from './asyncContainerStorage.js';
import { isServer } from './utils/isServer.js';

export function withScope<T>(runFn: () => T): T;
export function withScope<T>(overrides: DefinitionOverride[], runFn: () => T): T;
export function withScope<T>(overridesOrRunFn: DefinitionOverride[] | (() => T), runFn?: () => T): T {
  const overrides = (runFn ? overridesOrRunFn : []) as DefinitionOverride[];
  const run = (runFn || overridesOrRunFn) as () => T;

  if (!isServer) {
    throw new Error(
      `withScope is not supported on the browser. It requires AsyncLocalStorage that is only available on the NodeJS.`,
    );
  }

  return runWithContainer(useContainer().checkoutScope({ overrides: overrides }), run);
}
