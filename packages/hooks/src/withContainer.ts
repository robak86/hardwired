import { __storage, DefinitionOverride, getContainer, hasContainer } from './containerStorage.js';
import { container } from 'hardwired';

export function withContainer<T>(runFn: () => T): T;
export function withContainer<T>(overrides: DefinitionOverride[], runFn: () => T): T;
export function withContainer<T>(overridesOrRunFn: DefinitionOverride[] | (() => T), runFn?: () => T): T {
  const overrides = runFn ? overridesOrRunFn : [];
  const run = runFn || overridesOrRunFn;

  if (hasContainer()) {
    if (overrides.length > 0) {
      throw new Error('Cannot use implicit container with global overrides');
    }

    return __storage.run({ container: getContainer() }, run as () => T);
  } else {
    return __storage.run(
      { container: container({ globalOverrides: overrides as DefinitionOverride[] }) },
      run as () => T,
    );
  }
}

export function bindContainer<T>(runFn: () => T): () => T;
export function bindContainer<T>(overrides: DefinitionOverride[], runFn: () => T): () => T;
export function bindContainer<T>(...args: any[]): () => T {
  return () => withContainer(...(args as [any]));
}
