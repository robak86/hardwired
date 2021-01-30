import { ContainerContext, Instance, Module } from 'hardwired';
import { Action, AnyAction, Store } from 'redux';

export class DispatchResolver<TActionArgs extends any[]> extends Instance<(...TActionArgs) => void, []> {
  constructor(private action: (...args: any) => Action, private storeModule: Module<any>, private storeKey: string) {
    super();
  }

  build(context: ContainerContext): any {
    const store = context.get(this.storeModule, this.storeKey) as Store<any>;

    if (!context.hasInGlobalScope(this.id)) {
      const dispatch = (...args) => {
        store.dispatch(this.action(...args));
      };

      context.setForGlobalScope(this.id, dispatch);
    }

    return context.getFromGlobalScope(this.id);
  }
}

export type DispatchResolverBuilder = {
  <TActionArgs extends any[], TAction extends AnyAction>(actionCreator: (...args: TActionArgs) => TAction): Instance<
    (...args: TActionArgs) => void,
    []
  >;
};

export const bindDispatchBuilder = (storeModule, storeKey): DispatchResolverBuilder => actionCreator => {
  return new DispatchResolver(actionCreator, storeModule, storeKey);
};
