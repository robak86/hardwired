import React from 'react';
import { Module, RegistryRecord } from 'hardwired';
import { DependencyFactory } from '../../../core/src/module/RegistryRecord';
import { useContainerContext } from './createContainer';

export type ComponentsDefinitionsKeys<TRegistryRecord extends RegistryRecord> = {
  [K in keyof TRegistryRecord]: TRegistryRecord[K] extends DependencyFactory<React.ComponentType> ? K : never;
}[keyof TRegistryRecord];

export type ComponentsDefinitions<TRegistryRecord extends RegistryRecord> = {
  [K in ComponentsDefinitionsKeys<TRegistryRecord>]: TRegistryRecord[K];
};

export type ComponentProps<
  TRegistryRecord extends RegistryRecord,
  TComponentName extends ComponentsDefinitionsKeys<TRegistryRecord>
> = {
  module: Module<TRegistryRecord>;
  name: ComponentsDefinitionsKeys<TRegistryRecord>;
} & (TRegistryRecord[TComponentName] extends DependencyFactory<React.ComponentType<infer TProps>>
  ? Partial<TProps>
  : {});

export function Component<
  TRegistryRecord extends RegistryRecord,
  TComponentName extends ComponentsDefinitionsKeys<TRegistryRecord>
>({ module, name, ...rest }: ComponentProps<TRegistryRecord, TComponentName>) {
  const { container } = useContainerContext();
  const InnerComponent: any = container.get(module, name as any);

  return <InnerComponent {...rest} />;
}
