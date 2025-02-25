import { Definition, InstancesArray } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';
import { useReactLifeCycleInterceptor } from '../interceptors/ReactLifeCycleInterceptor.js';
import { useEffect } from 'react';

export type UseDefinitionsHook = {
  <TDefinitions extends Array<Definition<any, any, []>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
};

export const useAll: UseDefinitionsHook = (...definitions) => {
  const container = useContainer();
  const interceptor = useReactLifeCycleInterceptor();

  const instances = container.all(...definitions);

  useEffect(() => {
    const graphNodes = definitions.map(definition => interceptor?.getGraphNode(definition));

    graphNodes.forEach(graphNode => graphNode?.acquire());

    return () => {
      graphNodes.forEach(graphNode => graphNode?.release());
    };
  }, [interceptor]);

  return instances as any;
};
