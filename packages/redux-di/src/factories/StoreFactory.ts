import {
  BaseDependencyResolver,
  ContainerEvents,
  DefinitionsSet,
  DependencyResolver,
  DependencyResolverFunction,
  ModuleRegistry,
} from '@hardwired/di';
import { ReducerFactory } from './ReducerFactory';
import { ContainerCache } from '@hardwired/di/lib/container/container-cache';
import { AlterableStore } from '../stack/AlterableStore';
import { SagaFactory } from './SagaFactory';
import { ContainerService } from '../../../di/src/container/ContainerService';

export class StoreFactory<TRegistry extends ModuleRegistry, AppState> extends BaseDependencyResolver<
  TRegistry,
  AlterableStore<AppState>
> {
  public type = 'store';
  public reducersResolvers: ReducerFactory<TRegistry, any>[] = [];
  public sagasResolvers: SagaFactory<TRegistry, any>[] = [];

  constructor(private resolver: DependencyResolverFunction<TRegistry, AppState>) {
    super();
  }

  build(registry: DefinitionsSet<TRegistry, any>, cache: ContainerCache, ctx) {
    const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver.build(registry, cache, ctx));
    const store = this.buildStore(cache, registry, ctx);
    store.replaceReducers(reducers);

    return store;
  }

  private buildStore(cache: ContainerCache, registry: DefinitionsSet<TRegistry, any>, ctx) {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const store = new AlterableStore(this.resolver(ContainerService.proxyGetter(registry, cache, ctx)));
      cache.setForGlobalScope(this.id, store);
      return store;
    }
  }

  onRegister(events: ContainerEvents): any {
    events.onDefinitionAppend.add(this.onChildDefinitionAppend);
  }

  onChildDefinitionAppend = (resolver: DependencyResolver<any, any>) => {
    if (resolver.type === 'reducer') {
      this.reducersResolvers.push(resolver as any);
    }

    if (resolver.type === 'saga') {
      this.sagasResolvers.push(resolver as any);
    }
  };
}
