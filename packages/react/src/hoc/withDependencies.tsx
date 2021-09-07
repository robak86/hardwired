import { DependencySelector, ModulePatch } from 'hardwired';
import React, { ComponentType, FC } from 'react';
import { useContainerContext } from '../context/ContainerContext';
import { useSelectScoped } from '../hooks/useSelectScoped';
import { Diff } from 'utility-types';

// TODO: add simplified version: withDependencies(inject.record({}))
export type WithDependenciesOptions<TExternalProps, TDependencies extends Record<string, any>> = {
  dependencies: DependencySelector<TDependencies>;
  withScope?:
    | boolean
    | {
        initializeOverrides?: (props: TExternalProps) => ModulePatch<any>[];
        invalidateKeys?: (props: TExternalProps) => ReadonlyArray<any>;
      };
};

export type WithDependenciesConfigured<TDependencies extends object, TExternalProps = {}> = {
  <TProps extends TDependencies>(WrappedComponent: ComponentType<TProps>): ComponentType<
    Diff<TProps, TDependencies> & TExternalProps
  >;
};

export function withDependencies<TDependencies extends Record<string, any>>(
  selector: DependencySelector<TDependencies>,
): WithDependenciesConfigured<TDependencies>;
export function withDependencies<TDependencies extends Record<string, any>, TExternalProps = {}>(
  config: WithDependenciesOptions<TExternalProps, TDependencies>,
): WithDependenciesConfigured<TDependencies, TExternalProps>;
export function withDependencies<TDependencies extends Record<string, any>, TExternalProps = {}>(
  configOrSelector: WithDependenciesOptions<TExternalProps, TDependencies> | DependencySelector<TDependencies>,
): WithDependenciesConfigured<TDependencies, TExternalProps> {
  return <TProps extends TDependencies>(
    WrappedComponent: ComponentType<TProps>,
  ): ComponentType<Diff<TProps, TDependencies> & TExternalProps> => {
    const ContainerScopeHOC: FC<TExternalProps> = ({ ...props }) => {
      const config = typeof configOrSelector === 'function' ? { dependencies: configOrSelector } : configOrSelector;

      if (config.withScope) {
        const scopeOverrides =
          typeof config.withScope === 'boolean' ? [] : config.withScope.initializeOverrides?.(props) ?? [];

        const invalidateKeys =
          typeof config.withScope === 'boolean' ? [] : config.withScope.invalidateKeys?.(props) ?? [];

        const deps = useSelectScoped(invalidateKeys, scopeOverrides, config.dependencies);

        return <WrappedComponent {...(props as any)} {...deps} />;
      } else {
        const containerContext = useContainerContext();
        const deps = containerContext.container?.getWithSelector(config.dependencies);

        return <WrappedComponent {...(props as any)} {...deps} />;
      }
    };

    return ContainerScopeHOC as any;
  };
}
