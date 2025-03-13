import type { Diff } from 'utility-types';
import type { ComponentType } from 'react';
import type { Definition } from 'hardwired';

import { useContainerContext } from '../context/ContainerContext.js';

export type WithDependenciesConfigured<TDependencies extends object, TExternalProps = {}> = <
  TProps extends TDependencies,
>(
  WrappedComponent: ComponentType<TProps>,
) => ComponentType<Diff<TProps, TDependencies> & TExternalProps>;

export function withDependencies<TDependencies extends Record<string, any>>(
  definition: Definition<TDependencies, any, any>,
): WithDependenciesConfigured<TDependencies> {
  return <TProps extends TDependencies>(
    WrappedComponent: ComponentType<TProps>,
  ): ComponentType<Diff<TProps, TDependencies>> => {
    const ContainerScopeHOC = ({ ...props }) => {
      const containerContext = useContainerContext();
      const deps = containerContext.container?.use(definition);

      return <WrappedComponent {...(props as any)} {...deps} />;
    };

    return ContainerScopeHOC as any;
  };
}
