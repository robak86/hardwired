import { ContainerContext, Instance } from 'hardwired';
import { createSelector } from 'reselect';
import { Store } from 'redux';
import invariant from 'tiny-invariant';

export class SelectorResolver<T, TDeps extends any[]> extends Instance<T, TDeps> {
  private hasSubscription = false;

  constructor(private select: () => T) {
    super();
  }

  build(context: ContainerContext): T {
    const store = this.getStore(context);
    const childSelectors = this.dependencies
      .filter(d => d instanceof SelectorResolver)
      .map(d => () => d.build(context));

    if (!context.hasInGlobalScope(this.id)) {
      const finalSelector = childSelectors.length > 0 ? createSelector(childSelectors, this.select) : this.select;
      context.setForGlobalScope(this.id, finalSelector);
    }

    // TODO: this registers many unnecessary subscriptions. Subscription should be created lazily only when some component uses a selector
    if (!this.hasSubscription) {
      store.subscribe(() => {
        context.getInstancesEvents(this.id).invalidateEvents.emit();
      });
      this.hasSubscription = true;
    }

    return context.getFromGlobalScope(this.id)(store.getState());
  }

  getStore(context: ContainerContext): Store<any> {
    const otherSelector = this.dependencies.find(d => d instanceof SelectorResolver);
    if (otherSelector instanceof SelectorResolver) {
      return otherSelector.getStore(context);
    }

    const depsSelectors = this.dependencies.map(d => d.build(context));
    const store = depsSelectors.find(dep => dep.subscribe);

    invariant(store, `Cannot fetch store instance`);
    return store;
  }
}

export type SelectorResolverParams = {
  <TReturn, TState>(select: (appState: TState) => TReturn, n: 0): SelectorResolver<TReturn, [Store<TState>]>;
  <TReturn, TState, TReturn1>(select: (appState: TReturn1) => TReturn, n: 1): SelectorResolver<
    TReturn,
    [Store<TState>, TReturn1]
  >;
};

export const selector: SelectorResolverParams = select => {
  return new SelectorResolver(select as any) as any;
};
