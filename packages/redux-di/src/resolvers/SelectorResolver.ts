import { ContainerContext, Instance } from "hardwired";
import { AlterableStore } from "../stack/AlterableStore";
import { StoreResolver } from "./StoreResolver";
import invariant from "tiny-invariant";
import { createSelector } from "reselect";

export class SelectorResolver<T> extends Instance<T, []> {
  private storeResolver: Record<string, (containerContext: ContainerContext) => AlterableStore<any>> = {};
  private hasSubscription = false;

  constructor(private select: () => T) {
    super();
  }

  build(context: ContainerContext, depsSelectors): T {
    const getStore = Object.values(this.storeResolver)[0];
    invariant(getStore, `Cannot find store instance`); // TODO: maybe we should provide store as an explicit dependency ?
    const store = getStore(context);

    if (!this.hasSubscription) {
      store.subscribe(() => {
        context.getInstancesEvents(this.id).invalidateEvents.emit();
      });
      this.hasSubscription = true;

      const finalSelector = depsSelectors.length > 0 ? createSelector(depsSelectors, this.select) : this.select;
      context.setForGlobalScope(this.id, finalSelector);
    }
    const selectedState = context.getFromGlobalScope(this.id)(store.getState());

    return selectedState;
  }

  onInit(ctx: ContainerContext): any {
    ctx.containerEvents.onSpecificDefinitionAppend.add(StoreResolver, event => {
      this.storeResolver[event.id] = event.get;
      invariant(Object.keys(this.storeResolver).length === 1, `Multiple store instances are currently not supported.`);
    });
  }
}

export type SelectorResolverParams<TState> = {
  <TReturn>(select: (appState: TState) => TReturn): Instance<TReturn, []>;
  <TReturn, TSelect1>(select: (deps: [TSelect1]) => TReturn): Instance<TReturn, [(state: TState) => TSelect1]>;
  <TReturn, TSelect1, TSelect2>(select: (deps: [TSelect1, TSelect2]) => TReturn): Instance<
    TReturn,
    [(state: TState) => TSelect1, (state: TState) => TSelect2]
  >;
};
