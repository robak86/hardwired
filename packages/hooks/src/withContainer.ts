import { DefinitionOverride, getContainer, hasContainer, runWithContainer } from './containerStorage.js';
import { container } from 'hardwired';

export function withContainer<T>(runFn: () => T): T;
export function withContainer<T>(overrides: DefinitionOverride[], runFn: () => T): T;
export function withContainer<T>(overridesOrRunFn: DefinitionOverride[] | (() => T), runFn?: () => T): T {
  const overrides = runFn ? overridesOrRunFn : [];
  const run = (runFn || overridesOrRunFn) as () => T;

  if (hasContainer()) {
    if (overrides.length > 0) {
      throw new Error('Cannot use implicit container with global overrides');
    }

    return runWithContainer(getContainer(), run);
  } else {
    return runWithContainer(container({ globalOverrides: overrides as DefinitionOverride[] }), run);
  }
}
