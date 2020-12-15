import { AcquiredInstance, ContainerContext, Instance } from 'hardwired';
import { createSelector } from 'reselect';
import { Store } from 'redux';
import invariant from 'tiny-invariant';

export class SelectorResolver<T, TDeps extends any[]> extends Instance<T, TDeps> {
  constructor(private select: () => T) {
    super();
  }

  build(context: ContainerContext): T {
    const store = this.getStore(context);
    const [storeResolver, ...selectorsResolvers] = this.dependencies;

    const childSelectors = selectorsResolvers.map(d => () => d.build(context));

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
    const [storeResolver, ...selectorsResolvers] = this.dependencies;
    invariant(storeResolver, `Missing store dependency`);

    return storeResolver.build(context);
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

export type SelectorResolverBuildFn = {
  <TReturn, TState>(select: (appState: TState) => TReturn, n: 0): SelectorResolver<TReturn, [Store<TState>]>;
  <TReturn, TState, TReturn1>(select: (appState: TReturn1) => TReturn, n: 1): SelectorResolver<
    TReturn,
    [Store<TState>, TReturn1]
  >;
  <TReturn, TState, TReturn1, TReturn2>(
    select: (return1: TReturn1, return2: TReturn2) => TReturn,
    n: 2,
  ): SelectorResolver<TReturn, [Store<TState>, TReturn1, TReturn2]>;
  <TReturn, TState, TReturn1, TReturn2, TReturn3>(
    select: (return1: TReturn1, return2: TReturn2, return3: TReturn3) => TReturn,
    n: 3,
  ): SelectorResolver<TReturn, [Store<TState>, TReturn1, TReturn2, TReturn3]>;

  <TReturn, TState, TReturn1, TReturn2, TReturn3, TReturn4>(
    select: (return1: TReturn1, return2: TReturn2, return3: TReturn3, return4: TReturn4) => TReturn,
    n: 4,
  ): SelectorResolver<TReturn, [Store<TState>, TReturn1, TReturn2, TReturn3, TReturn4]>;

  <TReturn, TState, TReturn1, TReturn2, TReturn3, TReturn4, TReturn5>(
    select: (return1: TReturn1, return2: TReturn2, return3: TReturn3, return4: TReturn4, return5: TReturn5) => TReturn,
    n: 5,
  ): SelectorResolver<TReturn, [Store<TState>, TReturn1, TReturn2, TReturn3, TReturn4, TReturn5]>;
};

export const selector: SelectorResolverBuildFn = select => {
  return new SelectorResolver(select as any) as any;
};
