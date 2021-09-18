import { ModulePatch } from 'hardwired';
import React, { ComponentType, FC } from 'react';
import { ContainerScope } from '../components/ContainerScope';

export type WithScopeConfig<TExternalProps> = {
  scopeOverrides?: ModulePatch<any>[] | ((props: TExternalProps) => ModulePatch<any>[]);
  invalidateKeys?: (props: TExternalProps) => ReadonlyArray<any>;
};

export const withScope =
  <TExternalProps extends object>(config: WithScopeConfig<TExternalProps> = {}) =>
  <TProps extends object>(WrappedComponent: ComponentType<TProps>): ComponentType<TProps & TExternalProps> => {
    const ContainerScopeHOC: FC<TProps & TExternalProps> = props => {
      const overrides =
        typeof config.scopeOverrides === 'function' ? config.scopeOverrides(props) : config.scopeOverrides;

      return (
        <ContainerScope scopeOverrides={overrides} invalidateKeys={config.invalidateKeys?.(props)}>
          <WrappedComponent {...(props as any)} />
        </ContainerScope>
      );
    };

    return ContainerScopeHOC;
  };
