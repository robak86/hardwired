import React, { ComponentType } from 'react';
import { useContainerContext } from '../context/ContainerContext.js';
import { Diff } from 'utility-types';
import { InstanceDefinition } from 'hardwired';

export type WithDependenciesConfigured<TDependencies extends object, TExternalProps = {}> = {
  <TProps extends TDependencies>(WrappedComponent: ComponentType<TProps>): ComponentType<
    Diff<TProps, TDependencies> & TExternalProps
  >;
};

export function withDependencies<TDependencies extends Record<string, any>>(
  definition: InstanceDefinition<TDependencies, any>,
): WithDependenciesConfigured<TDependencies> {
  return <TProps extends TDependencies>(
    WrappedComponent: ComponentType<TProps>,
  ): ComponentType<Diff<TProps, TDependencies>> => {
    const ContainerScopeHOC = ({ ...props }) => {
      const containerContext = useContainerContext();
      const deps = containerContext.container?.get(definition);

      return <WrappedComponent {...(props as any)} {...deps} />;
    };

    return ContainerScopeHOC as any;
  };
}
