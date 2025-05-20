import type { IDefinitionSymbol, InstancesArray } from 'hardwired';
import { useEffect } from 'react';

import { useContainer } from '../context/ContainerContext.js';
import { useReactLifeCycleInterceptor } from '../interceptors/ReactLifeCycleInterceptor.js';

import { useHasArrayChanged } from './helpers/useHasArrayChanged.js';

export type UseDefinitionsHook = <TDefinitions extends Array<IDefinitionSymbol<any, any>>>(
  ...definitions: [...TDefinitions]
) => InstancesArray<TDefinitions>;

export const useAll: UseDefinitionsHook = <TDefinitions extends Array<IDefinitionSymbol<any, any>>>(
  ...definitions: [...TDefinitions]
): InstancesArray<TDefinitions> => {
  const container = useContainer();
  const interceptor = useReactLifeCycleInterceptor();

  const instances = container.all(...definitions);

  const hasDependenciesChange = useHasArrayChanged(definitions);

  if (hasDependenciesChange) {
    throw new Error('useAll hook does not support changing dependencies');
  }

  useEffect(
    () => {
      const graphNodes = definitions.map(definition => interceptor?.getGraphNode(definition));

      graphNodes.forEach(graphNode => graphNode?.acquire());

      return () => {
        graphNodes.forEach(graphNode => graphNode?.release());
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interceptor], // we don't check dependencies here, because if they change we throw an error
  );

  return instances as InstancesArray<TDefinitions>;
};
