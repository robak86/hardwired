import { RegistryRecord } from '../../../core/src/module/RegistryRecord';
import { Module } from 'hardwired';
import { useContainerContext } from '../components/ContainerContext';

export const useDependency = <
  TRegistryRecord extends RegistryRecord,
  K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>
>(
  module: Module<TRegistryRecord>,
  key: K,
) => {
  const { container } = useContainerContext();
  return container.get(module, key); //TODO: leveraging only container cache. We have to be sure that it works
};
