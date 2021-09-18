import { ModulePatch } from 'hardwired';
import React, { ComponentType, FC } from 'react';
import { ContainerScope } from '../components/ContainerScope';

export type WithScopeConfig<TOverridesProps, TInvalidateKeysProps> = {
  scopeOverrides?: ModulePatch<any>[] | ((props: TOverridesProps) => ModulePatch<any>[]);
  invalidateKeys?: (props: TInvalidateKeysProps) => ReadonlyArray<any>;
};

export const withScope =
  <TExternalProps1 extends object, TExternalProps2 extends object>(
    config: WithScopeConfig<TExternalProps1, TExternalProps2> = {},
  ) =>
  <TProps extends object>(
    WrappedComponent: ComponentType<TProps>,
  ): ComponentType<TProps & TExternalProps1 & TExternalProps2> => {
    const ContainerScopeHOC: FC<TProps & TExternalProps1 & TExternalProps2> = props => {
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
