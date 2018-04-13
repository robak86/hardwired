import { AbstractDependencyResolver, ContainerCache, DependencyFactory, RegistryLookup } from "@hardwired/core";
import { ReducerResolver } from "./ReducerResolver";
import { AlterableStore } from "../stack/AlterableStore";
import { SagaResolver } from "./SagaResolver";

export class StoreResolver<AppState> extends AbstractDependencyResolver<AlterableStore<AppState>> {
  public reducersResolvers: DependencyFactory<any>[] = [];
  public sagasResolvers: DependencyFactory<any>[] = [];

  constructor(private resolver: DependencyFactory<AppState>) {
    super();
  }

  build(cache: ContainerCache) {
    const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver(cache));
    const store = this.buildStore(cache);
    store.replaceReducers(reducers);

    return store;
  }

  private buildStore(cache: ContainerCache) {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const initialState = this.resolver(cache);
      const store = new AlterableStore(initialState);
      cache.setForGlobalScope(this.id, store);
      return store;
    }
  }

  onInit(registry: RegistryLookup): any {
    this.reducersResolvers = registry.findFactoriesByResolverClass(ReducerResolver);
    this.sagasResolvers = registry.findFactoriesByResolverClass(SagaResolver);
  }

  // onRegister(events: ): any {
  //   events.onSpecificDefinitionAppend.add(ReducerFactory, resolver => this.reducersResolvers.push(resolver));
  //   events.onSpecificDefinitionAppend.add(SagaResolver, resolver => this.sagasResolvers.push(resolver));
  // }
}

export const store = <TAppState extends Record<any, any>>(
  defaultsState: DependencyFactory<TAppState>,
): StoreResolver<TAppState> => {
  return new StoreResolver<TAppState>(defaultsState);
};
