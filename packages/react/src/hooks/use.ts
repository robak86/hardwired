import {Definition, LifeTime} from 'hardwired';
import {useContainer} from '../context/ContainerContext.js';
import {useEffect} from 'react';
import {useReactLifeCycleInterceptor,} from '../interceptors/ReactLifeCycleInterceptor.js';

export type NotPromise<T> = T extends Promise<unknown> ? never : T;

export type UseDefinitionHook = {
  <TInstance>(
    factoryDefinition: Definition<NotPromise<TInstance>, LifeTime.scoped | LifeTime.singleton, []>,
  ): TInstance;
};

export const use: UseDefinitionHook = definition => {
  const container = useContainer();
  const instance = container.use(definition);
  const interceptor = useReactLifeCycleInterceptor();

  const graphNode = interceptor?.getGraphNode(definition);

  useEffect(() => {

    graphNode?.mount();

    return () => {
      graphNode?.unmount();
    };
  }, [interceptor, definition]);

  return instance;
};
