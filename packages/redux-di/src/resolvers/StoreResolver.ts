import { AbstractDependencyResolver, ContainerContext, DependencyFactory, ModuleLookup } from "hardwired";
import { ReducerResolver } from "./ReducerResolver";
import { AlterableStore } from "../stack/AlterableStore";
import { SagaResolver } from "./SagaResolver";

export class StoreResolver<AppState> extends AbstractDependencyResolver<AlterableStore<AppState>> {
  public reducersResolvers: DependencyFactory<any>[] = [];
  public sagasResolvers: DependencyFactory<any>[] = [];

  constructor(private resolver: DependencyFactory<AppState>) {
    super();
  }

  build(cache: ContainerContext) {
    const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver.get(cache));
    const store = this.buildStore(cache);
    store.replaceReducers(reducers);

    return store;
  }

  private buildStore(cache: ContainerContext) {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const initialState = this.resolver.get(cache);
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

export const store = <TAppState extends Record<any, any>>(
  defaultsState: DependencyFactory<TAppState>,
): StoreResolver<TAppState> => {
  return new StoreResolver<TAppState>(defaultsState);
};
