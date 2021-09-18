import { DependencySelector } from 'hardwired';
import React, { ComponentType } from 'react';
import { useContainerContext } from '../context/ContainerContext';
import { Diff } from 'utility-types';

export type WithDependenciesConfigured<TDependencies extends object, TExternalProps = {}> = {
  <TProps extends TDependencies>(WrappedComponent: ComponentType<TProps>): ComponentType<
    Diff<TProps, TDependencies> & TExternalProps
  >;
};

export function withDependencies<TDependencies extends Record<string, any>>(
  selector: DependencySelector<TDependencies>,
): WithDependenciesConfigured<TDependencies> {
  return <TProps extends TDependencies>(
    WrappedComponent: ComponentType<TProps>,
  ): ComponentType<Diff<TProps, TDependencies>> => {
    const ContainerScopeHOC = ({ ...props }) => {
      const containerContext = useContainerContext();
      const deps = containerContext.container?.select(selector);

      return <WrappedComponent {...(props as any)} {...deps} />;
    };

    return ContainerScopeHOC as any;
  };
}
