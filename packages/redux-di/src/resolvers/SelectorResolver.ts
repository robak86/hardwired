import { AcquiredInstance, Container, ContainerContext, Instance } from 'hardwired';
import { createSelector } from 'reselect';
import { Store, Unsubscribe } from 'redux';
import invariant from 'tiny-invariant';

export class SelectorResolver<T, TDeps extends any[]> extends Instance<T, TDeps> {
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

    return context.getFromGlobalScope(this.id)(store.getState());
  }

  acquire(context: ContainerContext): AcquiredInstance<T> {
    return new AcquiredSelector(this.id, context, this.getStore(context), this.build);
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

export class AcquiredSelector<TValue> extends AcquiredInstance<TValue> {
  private unsubscribe?: Function;

  constructor(
    protected resolverId: string,
    protected containerContext,
    private store: Store<any>,
    private select: (containerContext: ContainerContext) => TValue,
  ) {
    super(resolverId, containerContext);

    this.unsubscribe = this.store.subscribe(() => {
      this.instanceEvents.invalidateEvents.emit();
    });
  }

  dispose() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.instanceEvents.clearAll();
  }

  get(): TValue {
    return this.select(this.containerContext);
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
