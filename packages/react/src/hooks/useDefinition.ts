import { ExternalsValues, InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import invariant from "tiny-invariant";
import { useRequestContainer } from "../context/ContainerContext";

export type UseDefinitionHook = {
  <TInstance, TExt>(
    factoryDefinition: InstanceDefinition<TInstance, LifeTime, TExt>,
    ...externals: ExternalsValues<TExt>
  ): TInstance;
};

export const useDefinition: UseDefinitionHook = (definition, ...[externalValues]) => {

  invariant(definition.resolution === Resolution.sync, `Using async definitions in react components is not supported.`);
  const container = useRequestContainer(externalValues as any);

  return container.get(definition);
};
