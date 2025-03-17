import type { Definition, LifeTime } from 'hardwired';
import { useEffect, useRef } from 'react';

import { useContainer } from '../context/ContainerContext.js';
import { useReactLifeCycleInterceptor } from '../interceptors/ReactLifeCycleInterceptor.js';

export type UseDefinitionHookOptions =
  | {
      skipLifecycle: boolean;
      forceMount?: never;
      forceRemount?: never;
    }
  | {
      skipLifecycle?: never;
      forceMount: boolean;
      forceRemount?: never;
    }
  | {
      skipLifecycle?: never;
      forceMount?: never;
      forceRemount: boolean;
    };

export type UseDefinitionHook = <TInstance>(
  factoryDefinition: Definition<TInstance, LifeTime.singleton | LifeTime.scoped, []>,
  options?: UseDefinitionHookOptions,
) => TInstance;

function useAssertValidOptions(options: UseDefinitionHookOptions | undefined) {
  const initialOptions = useRef(options);

  useEffect(() => {
    if (initialOptions.current?.skipLifecycle !== options?.skipLifecycle) {
      throw new Error(`
      Currently changing options for use hook is not supported: 
      skipLifecycle: prev value: ${initialOptions.current?.skipLifecycle}, current value: ${options?.skipLifecycle}`);
    }

    if (initialOptions.current?.forceMount !== options?.forceMount) {
      throw new Error(`
      Currently changing options for use hook is not supported: 
      forceMount: prev value: ${initialOptions.current?.forceMount}, current value: ${options?.forceMount}`);
    }

    if (initialOptions.current?.forceRemount !== options?.forceRemount) {
      throw new Error(`
      Currently changing options for use hook is not supported: 
      forceRemount: prev value: ${initialOptions.current?.forceRemount}, current value: ${options?.forceRemount}`);
    }
  }, [options?.forceRemount, options?.forceMount, options?.skipLifecycle]);
}

export const use: UseDefinitionHook = (definition, options) => {
  const container = useContainer();
  const instance = container.use(definition);
  const interceptor = useReactLifeCycleInterceptor();

  useAssertValidOptions(options);

  useEffect(() => {
    const graphNode = interceptor?.getGraphNode(definition);

    if (options?.skipLifecycle) {
      return;
    }

    if (options?.forceRemount) {
      graphNode?.release(true);
      graphNode?.acquire(true);
    } else {
      graphNode?.acquire(options?.forceMount ?? false);
    }

    return () => {
      if (options?.skipLifecycle) {
        return;
      }

      graphNode?.release();
    };
  }, [interceptor, definition, options?.skipLifecycle, options?.forceRemount, options?.forceMount]);

  return instance;
};
