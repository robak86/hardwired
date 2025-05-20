import type { IContainer } from 'hardwired';
import { container as defaultContainer } from 'hardwired';
import type { FC, PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';

import type { ContainerContextValue } from '../context/ContainerContext.js';
import { ContainerContext } from '../context/ContainerContext.js';
import type { HookDefinition } from '../definitions/hook.js';
import { isShallowEqual } from '../utils/useMemoized.js';
import { hookValuesD } from '../definitions/hookValues.js';

export type ContainerProviderProps = {
  container?: IContainer;
  hooks?: Array<HookDefinition<any, any>>;
};

const useAssertHooksNotChanged = <T extends unknown[]>(hooks: T = [] as unknown as T) => {
  const prevHooks = useRef<T>(hooks);

  useEffect(() => {
    if (!isShallowEqual(prevHooks.current, hooks)) {
      console.error('Hooks changed from', prevHooks.current, 'to', hooks);

      throw new Error(`Hooks list cannot change on subsequent renders.`);
    }

    prevHooks.current = hooks; // Update the previous value
  }, [hooks]);
};

const empty_array: HookDefinition<any, any>[] = [] as HookDefinition<any, any>[];

export const ContainerProvider: FC<ContainerProviderProps & PropsWithChildren> = ({
  children,
  container,
  hooks = empty_array,
}) => {
  const containerInstance = useRef<ContainerContextValue>({ container: container || defaultContainer });

  // hook array should not change
  useAssertHooksNotChanged(hooks);

  if (container && container !== containerInstance.current.container) {
    throw new Error('Container instance cannot be changed');
  }

  // eagerly call hooks
  hooks.forEach(hook => {
    if (!containerInstance.current?.container) {
      throw new Error('Container instance is not initialized');
    }

    // we need to call the hook every time this component is rendered,
    // so react doesn't complain about calling fewer hooks than expected
    const hookValue: unknown = hook.hook();

    const registry = containerInstance.current.container.use(hookValuesD);

    if (registry instanceof Promise) {
      throw new Error('Hook values registry is not initialized');
    }

    registry.setHookValue(hook.id, hookValue);

    void containerInstance.current.container.use(hook);
  });

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={containerInstance.current} children={children} />;
};
