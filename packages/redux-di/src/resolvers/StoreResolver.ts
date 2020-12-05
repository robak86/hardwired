import { AbstractInstanceResolver, ContainerContext, Instance, ModuleLookup } from "hardwired";
import { ReducerResolver } from "./ReducerResolver";
import { AlterableStore } from "../stack/AlterableStore";
import { SagaResolver } from "./SagaResolver";

export class StoreResolver<TAppState> extends AbstractInstanceResolver<AlterableStore<TAppState>, [TAppState]> {
  public reducersResolvers: Instance<any>[] = [];
  public sagasResolvers: Instance<any>[] = [];

  constructor() {
    super();
  }

  build(cache: ContainerContext, [initialState]) {
    const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver.get(cache));
    const sagas = this.sagasResolvers.map(sagaResolver => sagaResolver.get(cache));

    const store = this.buildStore(cache, initialState);
    store.replaceReducers(reducers);

    return store;
  }

  private buildStore(cache: ContainerContext, initialState) {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const store = new AlterableStore(initialState);
      cache.setForGlobalScope(this.id, store);
      return store;
    }
  }

  onInit(registry: ModuleLookup<any>): any {
    this.reducersResolvers = registry.findFactoriesByResolverClass(ReducerResolver);
    this.sagasResolvers = registry.findFactoriesByResolverClass(SagaResolver);
  }

  // onRegister(events: ): any {
  //   events.onSpecificDefinitionAppend.add(ReducerFactory, resolver => this.reducersResolvers.push(resolver));
  //   events.onSpecificDefinitionAppend.add(SagaResolver, resolver => this.sagasResolvers.push(resolver));
  // }
}

export const store = <TAppState extends Record<any, any>>(): StoreResolver<TAppState> => {
  return new StoreResolver<TAppState>();
};
