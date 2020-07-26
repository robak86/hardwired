import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerEvents,
  ModuleRegistry,
  DependencyResolverFunction,
  RegistryRecord,
  ContainerService,
} from '@hardwired/di-core';
import { ReducerFactory } from './ReducerFactory';
import { AlterableStore } from '../stack/AlterableStore';
import { SagaFactory } from './SagaFactory';

export class StoreFactory<TRegistryRecord extends RegistryRecord, AppState> extends AbstractDependencyResolver<
  TRegistryRecord,
  AlterableStore<AppState>
> {
  public type = 'store';
  public reducersResolvers: ReducerFactory<any, any>[] = [];
  public sagasResolvers: SagaFactory<any, any>[] = [];

  constructor(private resolver: DependencyResolverFunction<TRegistryRecord, AppState>) {
    super();
  }

  build(registry: ModuleRegistry<TRegistryRecord, any>, cache: ContainerCache, ctx) {
    const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver.build(registry, cache, ctx));
    const store = this.buildStore(cache, registry, ctx);
    store.replaceReducers(reducers);

    return store;
  }

  private buildStore(cache: ContainerCache, registry: ModuleRegistry<TRegistryRecord, any>, ctx) {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const store = new AlterableStore(this.resolver(ContainerService.proxyGetter(registry, cache, ctx)));
      cache.setForGlobalScope(this.id, store);
      return store;
    }
  }

  onRegister(events: ContainerEvents): any {
    events.onSpecificDefinitionAppend.add(ReducerFactory, resolver => this.reducersResolvers.push(resolver));
    events.onSpecificDefinitionAppend.add(SagaFactory, resolver => this.sagasResolvers.push(resolver));
  }
}
