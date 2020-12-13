import { useContainer } from '../components/ContainerContext';
import { useEffect, useRef, useState } from 'react';
import { Module, ModuleBuilder, value } from 'hardwired';

export type WatchableHook = <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
  module: TModule,
  name: TDefinitionName & string,
) => Module.Materialized<TModule>[TDefinitionName];

// TODO: add second version which allows for watching only selected properties
// TODO: providing array for the last
/*
   const {watchedValue1, watchedValue2} = useWatchable(mod, 'obj', ['watchedValue1', 'watchedValue2']) // returns only selected properties
 */

export const useWatchable: WatchableHook = (module, name) => {
  const container = useContainer();
  const acquiredInstanceRef = useRef<any>(container.acquireInstanceResolver(module, name));

  const events = acquiredInstanceRef.current.getEvents(module, name);
  const [invalidateCount, setInvalidateCount] = useState(0);
  const instanceRef = useRef<any>(container.get(module, name));

  // TODO: use container.getResolver().(isStateFull?, isObservable, isReactive?)
  // container.getResolver().subscribe() - subscriptions needs to be hold in container context (no state in resolvers)

  useEffect(() => {
    return events.invalidateEvents.add(() => {
      const newValue = container.get(module, name);
      if (instanceRef.current !== newValue) {
        instanceRef.current = newValue;
      }
      setInvalidateCount(invalidateCount + 1);
    });
  }, []);

  return instanceRef.current;
};
