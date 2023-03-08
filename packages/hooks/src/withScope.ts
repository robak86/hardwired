import {__storage, DefinitionOverride, getContainer, hasContainer} from './containerStorage.js';
import {container} from 'hardwired';

export function withScope<T>(runFn: () => T): T;
export function withScope<T>(overrides: DefinitionOverride[], runFn: () => T): T;
export function withScope<T>(overridesOrRunFn: DefinitionOverride[] | (() => T), runFn?: () => T): T {
  const overrides = (runFn ? overridesOrRunFn : []) as DefinitionOverride[];
  const run = runFn || overridesOrRunFn;

  if (hasContainer()) {
    return __storage.run({ container: getContainer().checkoutScope({ overrides: overrides }) }, run as () => T);
  } else {
    console.warn(`Missing container context. Using implicit temporal container`);
    return __storage.run({ container: container().checkoutScope({ overrides: overrides }) }, run as () => T);
  }
}
