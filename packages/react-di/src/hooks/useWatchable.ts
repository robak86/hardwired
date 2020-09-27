import { useContainerContext } from '../components/ContainerContext';
import { useEffect, useState } from 'react';
import { Module, RegistryRecord } from 'hardwired';

export type WatchableHook = <
  TRegistryRecord extends RegistryRecord,
  TDefinitionName extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>
>(
  module: Module<TRegistryRecord>,
  name: TDefinitionName & string,
) => RegistryRecord.Materialized<TRegistryRecord>[TDefinitionName];

export const useWatchable: WatchableHook = (module, name) => {
  const { container } = useContainerContext();
  const events = container.getEvents(module, name);
  const [invalidateCount, setInvalidateCount] = useState(0);

  const value = container.get(module, name);

  useEffect(() => {
    return events.invalidateEvents.add(() => {
      // TODO: add equality check
      setInvalidateCount(invalidateCount + 1);
    });
  }, []);

  return value;
};
