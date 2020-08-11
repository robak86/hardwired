import { AbstractDependencyResolver, ContainerCache, DependencyFactory, ModuleRegistry } from '@hardwired/di-next';
import { ReducerResolver } from './ReducerResolver';
import { AlterableStore } from '../stack/AlterableStore';
import { SagaResolver } from './SagaResolver';

export class StoreResolver<AppState> extends AbstractDependencyResolver<AlterableStore<AppState>> {
  public reducersResolvers: ReducerResolver<any>[] = [];
  public sagasResolvers: SagaResolver<any>[] = [];

  constructor(private resolver: DependencyFactory<AppState>) {
    super();
  }

  build(cache: ContainerCache) {
    const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver.build(cache));
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

  onInit(registry: ModuleRegistry): any {

    // TODO: discover all reducer and sagas resolvers
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
