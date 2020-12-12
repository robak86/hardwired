import { ContainerContext, Instance } from 'hardwired';
import { createSelector } from 'reselect';
import { Store } from 'redux';

export class SelectorResolver<T> extends Instance<T, []> {
  private hasSubscription = false;

  constructor(private select: () => T) {
    super();
  }

  build(context: ContainerContext, depsSelectors): T {
    const store = depsSelectors.find(dep => dep.subscribe);
    const childSelectors = depsSelectors.filter(dep => typeof dep === 'function');

    if (!this.hasSubscription) {
      store.subscribe(() => {
        context.getInstancesEvents(this.id).invalidateEvents.emit();
      });
      this.hasSubscription = true;

      const finalSelector = childSelectors.length > 0 ? createSelector(childSelectors, this.select) : this.select;
      context.setForGlobalScope(this.id, finalSelector);
    }

    return context.getFromGlobalScope(this.id)(store.getState());
  }

  onInit(ctx: ContainerContext): any {
    // ctx.containerEvents.onSpecificDefinitionAppend.add(StoreResolver, event => {
    //   this.storeResolver[event.id] = event.get;
    //   invariant(Object.keys(this.storeResolver).length === 1, `Multiple store instances are currently not supported.`);
    // });
  }
}

export type SelectorResolverParams = {
  <TReturn, TState>(select: (appState: TState) => TReturn, n:0): Instance<TReturn, [], [Store<TState>]>;
  <TReturn, TState, TReturn1>(select: (appState: TReturn1) => TReturn, n:1): Instance<
    TReturn,
    [TReturn1],
    [Store<TState>]
  >;
};

// export type SelectorResolverParams = {
//   <TReturn, TState>(select: (appState: TState) => TReturn, n:0): Instance<TReturn, [], [Store<TState>]>;
//   <TReturn, TState, TReturn1>(select: (appState: TReturn1) => TReturn, n:1): Instance<
//     TReturn,
//     [(state: TState) => TReturn1],
//     [Store<TState>]
//     >;
// };

export const selector: SelectorResolverParams = select => {
  return new SelectorResolver(select as any);
};

export const selector2: SelectorResolverParams = select => {
  return new SelectorResolver(select as any);
};
