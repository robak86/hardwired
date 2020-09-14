import React, { useMemo } from 'react';
import { Module, RegistryRecord } from 'hardwired';
import { DependencyFactory } from '../../../core/src/module/RegistryRecord';
import { useContainerContext } from './ContainerContext';
import { MaterializedComponent } from '../resolvers/ComponentResolver';

export type ComponentsDefinitionsKeys<TRegistryRecord extends RegistryRecord> = {
  [K in keyof TRegistryRecord]: TRegistryRecord[K] extends DependencyFactory<MaterializedComponent<any>> ? K : never;
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
} & (TRegistryRecord[TComponentName] extends DependencyFactory<MaterializedComponent<React.ComponentType<infer TProps>>>
  ? Partial<TProps>
  : {});

export function Component<
  TRegistryRecord extends RegistryRecord,
  TComponentName extends ComponentsDefinitionsKeys<TRegistryRecord>
>({ module, name, ...rest }: ComponentProps<TRegistryRecord, TComponentName>) {
  const { container } = useContainerContext();

  const { component: InnerComponent, props } = container.get(module, name as any) as any;

  // const { component: InnerComponent, props } = useMemo(() => {
  //   return container.get(module, name as any) as any;
  // }, [rest]);

  return <InnerComponent {...props} {...rest} />;
}
