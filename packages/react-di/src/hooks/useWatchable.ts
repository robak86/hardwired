import { useContainer } from '../components/ContainerContext';
import { useEffect, useState } from 'react';
import { RegistryRecord, ModuleBuilder, ModuleEntriesRecord, ModuleEntry, MaterializeModule} from "hardwired";
import { MaterializedRecord, ModuleInstancesKeys } from 'hardwired/lib/module/ModuleBuilder';

export type WatchableHook = <
  TModule extends ModuleBuilder<any>,
  TDefinitionName extends ModuleInstancesKeys<TModule>
>(
  module: TModule,
  name: TDefinitionName & string,
) => MaterializeModule<TModule>[TDefinitionName];

export const useWatchable: WatchableHook = (module, name) => {
  const container = useContainer();
  const events = container.getEvents(module, name);
  const [invalidateCount, setInvalidateCount] = useState(0);

  const value:any = container.get(module, name); //TODO: use correct types

  useEffect(() => {
    return events.invalidateEvents.add(() => {
      // TODO: add equality check
      setInvalidateCount(invalidateCount + 1);
    });
  }, []);

  return value;
};
