import { ContainerContext, Instance } from 'hardwired';
import { ReducerResolver } from './ReducerResolver';
import { AlterableStore } from '../stack/AlterableStore';
import { SagaResolver } from './SagaResolver';
import { ContainerEvents } from 'hardwired/lib/container/ContainerEvents';

export class StoreResolver<TAppState> extends Instance<AlterableStore<TAppState>, [TAppState]> {
  public reducersResolvers: Record<string, (containerContext: ContainerContext) => ReducerResolver<any>> = {};
  public sagasResolvers: Record<string, (containerContext: ContainerContext) => SagaResolver<any>> = {};

  constructor() {
    super();
  }

  build(context: ContainerContext, deps: any): AlterableStore<TAppState> {
    const reducers = Object.values(this.reducersResolvers).map(reducerResolver => reducerResolver(context));
    // TODO: add support for handling sagas
    const sagas = Object.values(this.sagasResolvers).map(sagaResolver => sagaResolver(context));

    const store = this.buildStore(context, deps[0]);
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

  onInit(ctx: ContainerContext): any {
    // TODO: add synchronize method -> pass resolver class + object for holding factories
    ctx.containerEvents.onSpecificDefinitionAppend.add(ReducerResolver, resolver => {
      this.reducersResolvers[resolver.id] = resolver.get;
    });

    ctx.containerEvents.onSpecificDefinitionAppend.add(SagaResolver, resolver => {
      this.sagasResolvers[resolver.id] = resolver.get;
    });
  }
}

export const store = <TAppState extends Record<any, any>>(): StoreResolver<TAppState> => {
  return new StoreResolver<TAppState>();
};
