import { Definition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';
import { useEffect } from 'react';
import { useReactLifeCycleInterceptor } from '../interceptors/ReactLifeCycleInterceptor.js';

export type NotPromise<T> = T extends Promise<unknown> ? never : T;

export type UseDefinitionHookOptions = {
  forceMount?: boolean;
  forceRemount?: boolean;
};

export type UseDefinitionHook = {
  <TInstance>(
    factoryDefinition: Definition<NotPromise<TInstance>, LifeTime.scoped | LifeTime.singleton, []>,
    options?: UseDefinitionHookOptions,
  ): TInstance;
};

export const use: UseDefinitionHook = (definition, options) => {
  const container = useContainer();
  const instance = container.use(definition);
  const interceptor = useReactLifeCycleInterceptor();

  const graphNode = interceptor?.getGraphNode(definition);

  useEffect(() => {
    if (options?.forceRemount) {
      graphNode?.unmount();
      graphNode?.mount();
    } else {
      graphNode?.mount(options?.forceMount ?? false);
    }

    return () => {
      graphNode?.unmount();
    };
  }, [interceptor, definition]);

  return instance;
};
