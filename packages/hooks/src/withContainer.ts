import { AnyInstanceDefinition, container, IContainer, LifeTime } from 'hardwired';
import { AsyncLocalStorage } from 'node:async_hooks';

type ContainerContext = {
  container: IContainer | null;
};

export type DefinitionOverride = AnyInstanceDefinition<any, LifeTime>;

const storage = new AsyncLocalStorage<ContainerContext>();

export function withContainer<T>(runFn: () => T): T;
export function withContainer<T>(overrides: DefinitionOverride[], runFn: () => T): T;
export function withContainer<T>(overridesOrRunFn: DefinitionOverride[] | (() => T), runFn?: () => T): T {
  const overrides = runFn ? overridesOrRunFn : [];
  const run = runFn || overridesOrRunFn;

  return storage.run({ container: container({ globalOverrides: overrides as DefinitionOverride[] }) }, run as () => T);
}

export function withScope<T>(runFn: () => T): T;
export function withScope<T>(overrides: DefinitionOverride[], runFn: () => T): T;
export function withScope<T>(overridesOrRunFn: DefinitionOverride[] | (() => T), runFn?: () => T): T {
  const overrides = (runFn ? overridesOrRunFn : []) as DefinitionOverride[];
  const run = runFn || overridesOrRunFn;

  return storage.run({ container: getContainer().checkoutScope({ scopeOverrides: overrides }) }, run as () => T);
}

export function withRequest<T>(runFn: () => T): T {
  return storage.run({ container: getContainer().checkoutRequestScope() as any}, runFn as () => T);
}

export const getContainer = () => {
  const container = storage.getStore()?.container;

  if (!container) {
    throw new Error(`Container is not in the scope.`);
  }
  return container;
};

