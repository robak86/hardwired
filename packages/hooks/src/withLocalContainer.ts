import { DefinitionOverride, hasLocalContainer, runWithContainer } from './asyncContainerStorage.js';
import { container } from 'hardwired';

export function withLocalContainer<T>(runFn: () => T): T;
export function withLocalContainer<T>(overrides: DefinitionOverride[], runFn: () => T): T;
export function withLocalContainer<T>(overridesOrRunFn: DefinitionOverride[] | (() => T), runFn?: () => T): T {
  const overrides = runFn ? overridesOrRunFn : [];
  const run = (runFn || overridesOrRunFn) as () => T;

  if (hasLocalContainer()) {
    throw new Error(
      `Nesting withLocalContainer is not supported. Use withScope instead. For replacing instances from parent container use overrides.`,
    );
  } else {
    return runWithContainer(container({ globalOverrides: overrides as DefinitionOverride[] }), run);
  }
}
