import { ModuleBuilder } from "hardwired";
import { useContainer } from "../components/ContainerContext";
import { Module } from "hardwired";

export const useDependency = <
  TModuleBuilder extends ModuleBuilder<any>,
  K extends Module.InstancesKeys<TModuleBuilder> & string
>(
  module: TModuleBuilder,
  key: K,
) => {
  const container = useContainer();
  return container.get(module, key); //TODO: leveraging only container cache. We have to be sure that it works
};
