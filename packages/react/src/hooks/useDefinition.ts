import { Module, ModuleBuilder } from 'hardwired';
import { useContainer } from '../components/ContainerContext';
import { useEffect, useRef } from 'react';
import { CancelFunction, isObservable } from '../abstract/IObservable';
import { useForceUpdate } from './helpers/useForceUpdate';
import { identity } from '../utils/basicFunctions';

export type UseDefinitionHook = {
  <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
    module: TModule,
    name: TDefinitionName & string,
  ): Module.Materialized<TModule>[TDefinitionName];

  <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>, TReturn>(
    module: TModule,
    name: TDefinitionName & string,
    select: (obj: Module.Materialized<TModule>[TDefinitionName]) => TReturn,
  ): TReturn;
};

export const useDefinition: UseDefinitionHook = (module, key, select = identity) => {
  const container = useContainer();
  const instanceRef = useRef(container.get(module, key));
  const subscriptionRef = useRef<null | CancelFunction>(null);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (isObservable(instanceRef.current) && !subscriptionRef.current) {
      subscriptionRef.current = instanceRef.current.subscribe(forceUpdate, select);
    }

    return () => subscriptionRef.current?.();
  }, []);

  return select(instanceRef.current);
};
