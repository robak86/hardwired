import { useEffect, useRef } from 'react';
import { useDefinition } from 'hardwired-react';
import { useForceUpdate } from '../../../react/src/hooks/helpers/useForceUpdate';
import { Unsubscribe } from '../../../react/src/abstract/IObservable';
import { Store } from 'redux';

export const bindUseSelector = (storeModule, storeDefinitionKey) => (module, key?): any => {
  const store = useDefinition(storeModule, storeDefinitionKey) as Store<any>;
  const selector = typeof module === 'function' ? module : (useDefinition(module, key) as (state: any) => any);
  const forceUpdate = useForceUpdate();

  const subscriptionRef = useRef<null | Unsubscribe>(null);
  const selectedValueRef = useRef<any>(selector(store.getState()));

  useEffect(() => {
    if (!subscriptionRef.current) {
      subscriptionRef.current = store.subscribe(() => {
        const newSelectedValue = selector(store.getState());
        if (selectedValueRef.current !== newSelectedValue) {
          selectedValueRef.current = newSelectedValue;
          forceUpdate();
        }
      });
    }

    return () => {
      subscriptionRef.current?.();
      subscriptionRef.current = null;
    };
  }, [module, key]);

  return selectedValueRef.current;
};
