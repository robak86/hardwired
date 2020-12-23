import { useMemo, useReducer, useRef } from "react";

const refEquality = (a, b) => a === b;

function useSelectorWithStoreAndSubscription(selector, equalityFn, store, contextSub) {
  const [, forceRender] = useReducer(s => s + 1, 0);

  const subscription = useMemo(() => new Subscription(store, contextSub), [store, contextSub]);

  const latestSubscriptionCallbackError = useRef();
  const latestSelector = useRef();
  const latestStoreState = useRef();
  const latestSelectedState = useRef();

  const storeState = store.getState();
  let selectedState;

  try {
    if (
      selector !== latestSelector.current ||
      storeState !== latestStoreState.current ||
      latestSubscriptionCallbackError.current
    ) {
      selectedState = selector(storeState);
    } else {
      selectedState = latestSelectedState.current;
    }
  } catch (err) {
    if (latestSubscriptionCallbackError.current) {
      err.message += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.current.stack}\n\n`;
    }

    throw err;
  }

  useIsomorphicLayoutEffect(() => {
    latestSelector.current = selector;
    latestStoreState.current = storeState;
    latestSelectedState.current = selectedState;
    latestSubscriptionCallbackError.current = undefined;
  });

  useIsomorphicLayoutEffect(() => {
    function checkForUpdates() {
      try {
        const newSelectedState = latestSelector.current(store.getState());

        if (equalityFn(newSelectedState, latestSelectedState.current)) {
          return;
        }

        latestSelectedState.current = newSelectedState;
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selectors are called again, and
        // will throw again, if neither props nor store state
        // changed
        latestSubscriptionCallbackError.current = err;
      }

      forceRender();
    }

    subscription.onStateChange = checkForUpdates;
    subscription.trySubscribe();

    checkForUpdates();

    return () => subscription.tryUnsubscribe();
  }, [store, subscription]);

  return selectedState;
}
