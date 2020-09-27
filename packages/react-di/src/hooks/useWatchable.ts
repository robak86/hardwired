import { useContainerContext } from "../components/ContainerContext";
import React, { useEffect, useState } from "react";
import { MaterializedComponent } from "../resolvers/ComponentResolver";
import { Module } from "hardwired";
import { DependencyFactory, RegistryRecord } from "../../../core/src/module/RegistryRecord";

export type WatchableHook = <
  TRegistryRecord extends RegistryRecord,
  TDefinitionName extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>
>(params: {
  module: Module<TRegistryRecord>;
  name: TDefinitionName,
}) => TRegistryRecord[TDefinitionName] extends DependencyFactory<
  MaterializedComponent<React.ComponentType<infer TProps>>
>
  ? Partial<TProps>
  : {};

export const useWatchable: WatchableHook = (module, name) => {
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
};
