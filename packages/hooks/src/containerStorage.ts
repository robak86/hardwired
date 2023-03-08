import { AnyInstanceDefinition, IContainer, LifeTime } from 'hardwired';
import { AsyncLocalStorage } from 'node:async_hooks';

export type ContainerContext = {
  container: IContainer | null;
};

export type DefinitionOverride = AnyInstanceDefinition<any, LifeTime>;

export const __storage = new AsyncLocalStorage<ContainerContext>();

export function withScope<T>(runFn: () => T): T {
  return __storage.run({ container: getContainer().checkoutScope() as any }, runFn as () => T);
}

export const hasContainer = () => {
  return !!__storage.getStore()?.container;
};

export const getContainer = () => {
  const container = __storage.getStore()?.container;

  if (!container) {
    throw new Error(`Container is not in the scope.`);
  }
  return container;
};
