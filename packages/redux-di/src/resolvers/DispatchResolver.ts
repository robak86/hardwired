import { ContainerContext, Instance } from "hardwired";
import { Action } from "redux";
import { AlterableStore } from "../stack/AlterableStore";
import { ContainerEvents } from "hardwired/lib/container/ContainerEvents";

export class DispatchResolver<TActionArgs extends any[]> extends Instance<(...TActionArgs) => void, []> {
  private storeResolver: Instance<AlterableStore<any>, any>[] | [Instance<AlterableStore<any>, any>] = [];

  constructor(private action: (...args: any) => Action) {
    super();
  }

  onInit(registry: ContainerEvents): any {
    throw new Error('Implement me');
    // this.storeResolver = registry.findAncestorResolvers(StoreResolver);
    // invariant(this.storeResolver.length === 1, `Multiple store instances are currently not supported`);
  }

  build(context: ContainerContext): any {
    throw new Error('TODO');
    // const storeInstance = this.storeResolver[0];
    // const store = storeInstance.build(context);
    //
    // return (...args) => {
    //   store.dispatch(this.action(...args));
    // };
  }
}

export type DispatchResolverParams<TAction extends Action> = {
  <TActionArgs extends any[]>(actionCreator: (...args: TActionArgs) => TAction): DispatchResolver<any>;
};

export const dispatch: DispatchResolverParams<Action> = actionCreator => {
  return new DispatchResolver(actionCreator);
};
