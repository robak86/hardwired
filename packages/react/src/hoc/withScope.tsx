import React, { ComponentType, FC } from 'react';
import { ContainerScope, ContainerScopeProps } from '../components/ContainerScope';

export function withScope<TProps>(
  WrappedComponent: ComponentType<TProps>,
): ComponentType<TProps & ContainerScopeProps> {
  const ContainerScopeHOC: FC<TProps & ContainerScopeProps> = ({ invalidateKeys, scopeOverrides, ...props }) => {
    return (
      <ContainerScope scopeOverrides={scopeOverrides} invalidateKeys={invalidateKeys}>
        <WrappedComponent {...(props as any)} />
      </ContainerScope>
    );
  };

  return ContainerScopeHOC;
}
