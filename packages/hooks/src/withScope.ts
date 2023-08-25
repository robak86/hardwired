import { DefinitionOverride, getContainer, hasContainer, runWithContainer } from './containerStorage.js';
import { container } from 'hardwired';
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

  if (!hasContainer()) {
    throw new Error(
      `Container is not in the current execution scope. Wrap your code with withContainer(() => your code here)`,
    );
  }

  return runWithContainer(getContainer().checkoutScope({ overrides: overrides }), run);
}
