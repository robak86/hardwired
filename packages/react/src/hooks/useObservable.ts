import { useContainer } from '../context/ContainerContext';
import { useEffect, useRef } from 'react';
import { IObservable, isObservable, Unsubscribe } from '../abstract/IObservable';
import { useForceRender } from './helpers/useForceRender';
import { identity } from '../utils/fp';
import invariant from 'tiny-invariant';
import { InstanceDefinition } from 'hardwired';

export type UseObservableHook = {
  <TInstance>(definition: InstanceDefinition<TInstance, any>): TInstance extends IObservable<infer TState>
    ? TState
    : unknown;

  <TInstance, TReturn>(
    definition: InstanceDefinition<TInstance, any>,
    select: (obj: TInstance extends IObservable<infer TState> ? TState : unknown) => TReturn,
  ): TReturn;
};

export const useObservable: UseObservableHook = (definition, select = identity) => {
  const container = useContainer();
  const forceUpdate = useForceRender();
  const instanceRef = useRef(container.get(definition));
  const subscriptionRef = useRef<null | Unsubscribe>(null);
  const selectedValueRef = useRef<any>(null);
  const hasBeenDispatchedRef = useRef(false);

  invariant(
    isObservable(instanceRef.current),
    `Cannot use useObservable on ${definition.id}. Given object does not implement subscribe method`,
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
  invariant(hasBeenDispatchedRef.current, `Module ${definition.id} didn't dispatch synchronously subscribe callback`);

  useEffect(() => () => subscriptionRef.current?.(), []);

  return selectedValueRef.current;
};
