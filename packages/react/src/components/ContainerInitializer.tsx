import type { FC, PropsWithChildren } from 'react';

import type { ContainerInitializerDefinition } from '../hooks/useInitializers.js';
import { useInitializers } from '../hooks/useInitializers.js';

export type ContainerInitializerProps = PropsWithChildren<{
  init: Array<ContainerInitializerDefinition> | ContainerInitializerDefinition;
}>;

export const ContainerInitializer: FC<ContainerInitializerProps> = props => {
  const initializers = Array.isArray(props.init) ? props.init : [props.init];

  useInitializers(...initializers);

  return <>{props.children}</>;
};
