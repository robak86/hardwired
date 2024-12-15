import { container as defaultContainer, IContainer } from 'hardwired';
import { ContainerContext, ContainerContextValue } from '../context/ContainerContext.js';
import { FC, PropsWithChildren, useEffect, useRef } from 'react';
import { HookDefinition } from '../definitions/hook.js';
import { isShallowEqual } from '../utils/useMemoized.js';
import { initializedHooksD } from '../definitions/initializedHooks.js';

export type ContainerProviderProps = {
  container?: IContainer;
  hooks?: Array<HookDefinition<any, any, any>>;
};

const useAssertHooksNotChanged = <T extends any[]>(hooks: T = [] as unknown as T) => {
  const prevHooks = useRef<T>(hooks);

  useEffect(() => {
    if (!isShallowEqual(prevHooks.current, hooks)) {
      throw new Error(`Hooks changed from ${prevHooks.current} to ${hooks}. Hooks list cannot change.`);
    }
    prevHooks.current = hooks; // Update the previous value
  }, [hooks]);
};

const empty_array: HookDefinition<any, any, any>[] = [];

export const ContainerProvider: FC<ContainerProviderProps & PropsWithChildren> = ({
  children,
  container,
  hooks = empty_array,
}) => {
  const containerInstance = useRef<ContainerContextValue | null>();

  // hook array should not change
  useAssertHooksNotChanged(hooks);

  if (!containerInstance.current) {
    containerInstance.current = {
      container: container || defaultContainer,
    };
  }

  // eagerly call hooks
  hooks.forEach(hook => {
    if (!containerInstance.current?.container) {
      throw new Error('Container instance is not initialized');
    }

    containerInstance.current.container.use(initializedHooksD).markInitialized(hook.id);
    containerInstance.current.container.use(hook);
  });

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={containerInstance.current} children={children} />;
};
