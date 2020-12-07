import { Instance, ContainerContext, ModuleLookup } from 'hardwired';
import { ReducerResolver } from './ReducerResolver';
import { AlterableStore } from '../stack/AlterableStore';
import { SagaResolver } from './SagaResolver';
import { ContainerEvents } from "hardwired/lib/container/ContainerEvents";

export class StoreResolver<TAppState> extends Instance<AlterableStore<TAppState>, [TAppState]> {
  public reducersResolvers: Instance<any, any>[] = [];
  public sagasResolvers: Instance<any, any>[] = [];

  constructor() {
    super();
  }

  build(context: ContainerContext, deps: any): AlterableStore<TAppState> {
    throw new Error("implement me")
    // const reducers = this.reducersResolvers.map(reducerResolver => reducerResolver.get(cache));
    // const sagas = this.sagasResolvers.map(sagaResolver => sagaResolver.get(cache));
    //
    // const store = this.buildStore(cache, initialState);
    // store.replaceReducers(reducers);
    //
    // return store;
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

  onInit(registry: ContainerEvents): any {
    throw new Error("Implement me")
    // this.reducersResolvers = registry.findFactoriesByResolverClass(ReducerResolver);
    // this.sagasResolvers = registry.findFactoriesByResolverClass(SagaResolver);
  }

  // onRegister(events: ): any {
  //   events.onSpecificDefinitionAppend.add(ReducerFactory, resolver => this.reducersResolvers.push(resolver));
  //   events.onSpecificDefinitionAppend.add(SagaResolver, resolver => this.sagasResolvers.push(resolver));
  // }
}

export const store = <TAppState extends Record<any, any>>(): StoreResolver<TAppState> => {
  return new StoreResolver<TAppState>();
};
