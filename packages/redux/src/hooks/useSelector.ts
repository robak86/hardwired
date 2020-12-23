import { useEffect, useReducer, useRef } from "react";
import { Module, ModuleBuilder } from "@hardwired/core";
import { useContainer } from "@hardwired/react";
import { StoreFactoryResolver } from "../resolvers/StoreFactory";

export type SelectorHook = <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
  module: TModule,
  name: TDefinitionName & string,
  ...args: Module.Materialized<TModule>[TDefinitionName] extends (...args: infer TArgs) => any ? TArgs : []
) => Module.Materialized<TModule>[TDefinitionName] extends (...args: any[]) => infer TReturn ? TReturn : unknown;

// TODO: add second version which allows for watching only selected properties
// TODO: providing array for the last
/*
   const {watchedValue1, watchedValue2} = useWatchable(mod, 'obj', ['watchedValue1', 'watchedValue2']) // returns only selected properties
 */

export const useSelector: SelectorHook = (module, name, ...args) => {
  const container = useContainer();
  const storeRef = useRef<any>(container.getByType(StoreFactoryResolver));

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const acquiredInstanceRef = useRef<any>(container.acquireInstanceResolver(module, name));
  const events = acquiredInstanceRef.current.getEvents();
  const instanceRef = useRef<any>(acquiredInstanceRef.current.get());

  useEffect(() => {
    events.invalidateEvents.add(() => {
      const newValue = acquiredInstanceRef.current.get();
      // console.log('comparing', newValue, instanceRef.current);
      if (instanceRef.current !== newValue) {
        instanceRef.current = newValue;
      }

      console.log('invalidate');
      forceUpdate();
    });

    return () => acquiredInstanceRef.current.dispose();
  }, []);

  return instanceRef.current;
};
