import { Module, ModuleBuilder } from 'hardwired';
import { useContainer } from '../context/ContainerContext';
import { useEffect, useRef } from 'react';
import { IObservable, isObservable, Unsubscribe } from '../abstract/IObservable';
import { useForceUpdate } from './helpers/useForceUpdate';
import { identity } from '../utils/fp';
import invariant from 'tiny-invariant';

export type UseObservableHook = {
  <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
    module: TModule,
    name: TDefinitionName & string,
  ): Module.Materialized<TModule>[TDefinitionName] extends IObservable<infer TState> ? TState : unknown;

  <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>, TReturn>(
    module: TModule,
    name: TDefinitionName & string,
    select: (
      obj: Module.Materialized<TModule>[TDefinitionName] extends IObservable<infer TState> ? TState : unknown,
    ) => TReturn,
  ): TReturn;
};

export const useObservable: UseObservableHook = (module, key, select = identity) => {
  const container = useContainer();
  const forceUpdate = useForceUpdate();
  const instanceRef = useRef(container.get(module, key));
  const subscriptionRef = useRef<null | Unsubscribe>(null);
  const selectedValueRef = useRef<any>(null);
  const hasBeenDispatchedRef = useRef(false);

  invariant(
    isObservable(instanceRef.current),
    `Cannot use useObservable on ${module.moduleId}:${key}. Given object does not implement subscribe method`,
  );

  if (!subscriptionRef.current) {
    subscriptionRef.current = instanceRef.current.subscribe(newValue => {
      hasBeenDispatchedRef.current = true;
      const newSelectedValue = select(newValue);
      if (selectedValueRef.current !== newSelectedValue) {
        selectedValueRef.current = newSelectedValue;
        forceUpdate();
      }
    });
  }

  // Cannot allow async initial subscribe dispatch because this hook would have to return undefined|null for the first render
  invariant(
    hasBeenDispatchedRef.current,
    `Module ${module.moduleId}.${key} didn't dispatch synchronously subscribe callback`,
  );

  useEffect(() => () => subscriptionRef.current?.(), []);

  return selectedValueRef.current;
};
