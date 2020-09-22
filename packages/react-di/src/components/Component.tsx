import React, { useEffect, useState } from 'react';
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
  const [invalidateCount, setInvalidateCount] = useState(0);

  const { component: InnerComponent, props, subscribe } = container.get(module, name as any) as MaterializedComponent<
    any
  >;

  InnerComponent.displayName = name as string;
  useEffect(() => {
    return subscribe(() => {
      // TODO: add equality check
      setInvalidateCount(invalidateCount + 1);
    });
  }, []);

  return <InnerComponent {...props} {...rest} />;
}
