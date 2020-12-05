import { useContainer } from '../components/ContainerContext';
import { useEffect, useState } from 'react';
import { RegistryRecord, ModuleBuilder, ModuleEntriesRecord } from 'hardwired';
import { MaterializedRecord, ModuleInstancesKeys } from 'hardwired/lib/module/ModuleBuilder';

export type WatchableHook = <
  TRegistryRecord extends ModuleEntriesRecord,
  TDefinitionName extends ModuleInstancesKeys<TRegistryRecord>
>(
  module: ModuleBuilder<TRegistryRecord>,
  name: TDefinitionName & string,
) => MaterializedRecord<TRegistryRecord>[TDefinitionName];

export const useWatchable: WatchableHook = (module, name) => {
  const container = useContainer();
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
