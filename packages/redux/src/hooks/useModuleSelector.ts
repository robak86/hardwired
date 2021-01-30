import { Store, Unsubscribe } from 'redux';
import { useEffect, useRef } from 'react';
import { useDefinition, useForceRender } from 'hardwired-react';

export const useModuleSelector = (storeModule, storeDefinitionKey, module, key): any => {
  const store = useDefinition(storeModule, storeDefinitionKey) as Store<any>;

  const selectorRef = useRef(
    typeof module === 'function' ? module : (useDefinition(module, key) as (state: any) => any),
  );
  const forceUpdate = useForceRender();

  const subscriptionRef = useRef<null | Unsubscribe>(null);
  const selectedValueRef = useRef<any>(selectorRef.current(store.getState()));

  useEffect(() => {
    function checkForUpdates() {
      const newSelectedValue = selectorRef.current(store.getState());
      if (selectedValueRef.current !== newSelectedValue) {
        selectedValueRef.current = newSelectedValue;
        forceUpdate();
      }
    }

    if (!subscriptionRef.current) {
      subscriptionRef.current = store.subscribe(checkForUpdates);
    }

    checkForUpdates();

    return () => {
      subscriptionRef.current?.();
      subscriptionRef.current = null;
    };
  }, []);

  return selectedValueRef.current;
};
