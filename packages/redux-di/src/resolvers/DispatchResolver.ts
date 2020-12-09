import { ContainerContext, Instance } from 'hardwired';
import { Action } from 'redux';
import { AlterableStore } from '../stack/AlterableStore';
import { ContainerEvents } from 'hardwired/lib/container/ContainerEvents';
import { StoreResolver } from './StoreResolver';
import invariant from 'tiny-invariant';

export class DispatchResolver<TActionArgs extends any[]> extends Instance<(...TActionArgs) => void, []> {
  private storeResolver: Record<string, (containerContext: ContainerContext) => AlterableStore<any>> = {};

  constructor(private action: (...args: any) => Action) {
    super();
  }


  build(context: ContainerContext): any {
    const getStore = Object.values(this.storeResolver)[0];
    invariant(getStore, `Cannot find store instance`); // TODO: maybe we should provide
    const store = getStore(context);

    return (...args) => {
      store.dispatch(this.action(...args));
    };
  }

  onInit(containerEvents: ContainerEvents): any {
    containerEvents.onSpecificDefinitionAppend.add(StoreResolver, event => {
      this.storeResolver[event.id] = event.get;
      invariant(Object.keys(this.storeResolver).length === 1, `Multiple store instances are currently not supported.`);
    });
  }

}

export type DispatchResolverParams<TAction extends Action> = {
  <TActionArgs extends any[]>(actionCreator: (...args: TActionArgs) => TAction): Instance<
    (...args: TActionArgs) => void,
    []
  >;
};
