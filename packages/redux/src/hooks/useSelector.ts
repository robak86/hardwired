import { useModuleSelector } from './useModuleSelector';

export const bindUseSelector = (storeModule, storeDefinitionKey) => (module, key?): any => {
  if (typeof module !== 'function') {
    return useModuleSelector(storeModule, storeDefinitionKey, module, key);
  }

  // const store = useDefinition(storeModule, storeDefinitionKey) as Store<any>;
  //
  // const selectorRef = useRef(
  //   typeof module === 'function' ? module : (useDefinition(module, key) as (state: any) => any),
  // );
  // const forceUpdate = useForceRender();
  //
  // const subscriptionRef = useRef<null | Unsubscribe>(null);
  // const selectedValueRef = useRef<any>(selectorRef.current(store.getState()));
  //
  // useEffect(() => {
  //   function checkForUpdates() {
  //     const newSelectedValue = selectorRef.current(store.getState());
  //     if (selectedValueRef.current !== newSelectedValue) {
  //       selectedValueRef.current = newSelectedValue;
  //       forceUpdate();
  //     }
  //
  //     forceUpdate();
  //   }
  //
  //   if (!subscriptionRef.current) {
  //     subscriptionRef.current = store.subscribe(checkForUpdates);
  //   }
  //
  //   checkForUpdates();
  //
  //   return () => {
  //     subscriptionRef.current?.();
  //     subscriptionRef.current = null;
  //   };
  // }, []);
  //
  // return selectedValueRef.current;
};
