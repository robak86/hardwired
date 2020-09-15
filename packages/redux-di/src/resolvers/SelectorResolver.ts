import { AbstractDependencyResolver, ContainerContext, DependencyFactory, ModuleLookup } from 'hardwired';
import { StoreResolver } from './StoreResolver';
import invariant from 'tiny-invariant';
import { AlterableStore } from '../stack/AlterableStore';
import { createSelector } from 'reselect';

export class SelectorResolver<T> extends AbstractDependencyResolver<T> {
  private storeResolver: DependencyFactory<AlterableStore<any>>[] | [DependencyFactory<AlterableStore<any>>] = [];
  private hasSubscription = false;

  constructor(private select: () => T, private deps: SelectorResolver<any>[] = []) {
    super();
  }

  build(context: ContainerContext): T {
    const storeInstance = this.storeResolver[0];
    const store = storeInstance.get(context);

    if (!this.hasSubscription) {
      // TODO: implement unsubscribe
      store.subscribe(() => {
        storeInstance.notifyInvalidated();
      });
      this.hasSubscription = true;

      const depsSelectors = this.deps.map(selector => selector.build(context));
      const finalSelector = depsSelectors.length > 0 ? createSelector(depsSelectors, this.select) : this.select;
      context.setForGlobalScope(this.id, finalSelector);

      return finalSelector(store.getState());
    }

    return context.getFromGlobalScope(this.id)(store.getState());
  }

  onInit(registry: ModuleLookup<any>): any {
    this.storeResolver = registry.findAncestorResolvers(StoreResolver);
    invariant(this.storeResolver.length === 1, `Multiple store instances are currently not supported`);
  }
}

export type SelectorResolverParams<TState> = {
  <TReturn>(select: (appState: TState) => TReturn): StoreResolver<TReturn>;
  <TReturn>(select: (appState: TState) => TReturn): StoreResolver<TReturn>;
  <TReturn, TSelect1>(select: (deps: [TSelect1]) => TReturn, selectors: [StoreResolver<TSelect1>]): StoreResolver<
    TReturn
  >;
  <TReturn, TSelect1, TSelect2>(
    select: (deps: [TSelect1, TSelect2]) => TReturn,
    selectors: [StoreResolver<TSelect1>, StoreResolver<TSelect2>],
  ): StoreResolver<TReturn>;
};

export const selector: SelectorResolverParams<any> = (select, deps?) => {
  return new SelectorResolver(select, deps) as any;
};
