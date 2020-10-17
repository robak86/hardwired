import { AbstractDependencyResolver, ContainerContext, Instance, ModuleLookup } from 'hardwired';
import { ReducerResolver } from './ReducerResolver';
import { AlterableStore } from '../stack/AlterableStore';
import { SagaResolver } from './SagaResolver';

export class StoreResolver<AppState> extends AbstractDependencyResolver<AlterableStore<AppState>> {
  public reducersResolvers: Instance<any>[] = [];
  public sagasResolvers: Instance<any>[] = [];

  constructor(private resolver: Instance<AppState>) {
    super();
  }

  build(cache: ContainerContext) {
    const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver.get(cache));
    const sagas = this.sagasResolvers.map(sagaResolver => sagaResolver.get(cache));

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
  defaultsState: Instance<TAppState>,
): StoreResolver<TAppState> => {
  return new StoreResolver<TAppState>(defaultsState);
};
