import {
  BaseDependencyResolver,
  ContainerEvents,
  DependencyResolver,
  DependencyResolverFunction,
  ModuleRegistry,
  DefinitionsSet,
} from '@hardwired/di';
import { ReducerFactory } from './ReducerFactory';
import { ContainerCache } from '@hardwired/di/lib/container/container-cache';
import { AlterableStore } from '../AlterableStore';
import { proxyGetter } from '@hardwired/di/lib/container/proxyGetter';
import { SagaFactory } from './SagaFactory';

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

  build(registry: DefinitionsSet<TRegistry, any>, ctx: any, cache: ContainerCache) {
    const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver.build(registry, ctx, cache));
    const store = this.buildStore(cache, registry, ctx);
    store.replaceReducers(reducers);

    return store;
  }

  private buildStore(cache: ContainerCache, registry: DefinitionsSet<TRegistry, any>, ctx: any) {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const store = new AlterableStore(this.resolver(proxyGetter(registry, cache, ctx)));
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
