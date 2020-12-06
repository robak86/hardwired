import { ModuleBuilder } from "hardwired";
import { useContainer } from "../components/ContainerContext";
import { ModuleInstancesKeys } from "hardwired/lib/module/ModuleBuilder";

export const useDependency = <
  TModuleBuilder extends ModuleBuilder<any>,
  K extends ModuleInstancesKeys<TModuleBuilder> & string
>(
  module: TModuleBuilder,
  key: K,
) => {
  const container = useContainer();
  return container.get(module, key); //TODO: leveraging only container cache. We have to be sure that it works
};
