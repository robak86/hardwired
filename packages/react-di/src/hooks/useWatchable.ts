import { useContainer } from '../components/ContainerContext';
import { useEffect, useState } from 'react';
import { Module, ModuleBuilder } from 'hardwired';


export type WatchableHook = <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
  module: TModule,
  name: TDefinitionName & string,
) => Module.Materialized<TModule>[TDefinitionName];

export const useWatchable: WatchableHook = (module, name) => {
  const container = useContainer();
  const events = container.getEvents(module, name);
  const [invalidateCount, setInvalidateCount] = useState(0);

  const value: any = container.get(module, name); //TODO: use correct types


  useEffect(() => {
    return events.invalidateEvents.add(() => {
      // TODO: add equality check
      setInvalidateCount(invalidateCount + 1);
    });
  }, []);

  return value;
};
