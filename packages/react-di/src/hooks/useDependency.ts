import { RegistryRecord } from "../../../core/src/module/RegistryRecord";
import { ModuleBuilder, ModuleEntriesRecord } from "hardwired";
import { useContainer } from "../components/ContainerContext";
import { ModuleInstancesKeys } from "hardwired/lib/module/ModuleBuilder";

export const useDependency = <
  TRegistryRecord extends ModuleEntriesRecord,
  K extends ModuleInstancesKeys<TRegistryRecord> & string
>(
  module: ModuleBuilder<TRegistryRecord>,
  key: K,
) => {
  const container = useContainer();
  return container.get(module, key); //TODO: leveraging only container cache. We have to be sure that it works
};
