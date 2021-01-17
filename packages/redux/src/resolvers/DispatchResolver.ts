import { ContainerContext, Instance } from 'hardwired';
import { Action, AnyAction, Store } from 'redux';

export class DispatchResolver<TActionArgs extends any[]> extends Instance<(...TActionArgs) => void, [Store<any>]> {
  constructor(private action: (...args: any) => Action) {
    super();
  }

  build(context: ContainerContext): any {
    const dependencies = context.getDependencies(this.id);
    const [store] = dependencies.map(d => d.build(context));
    if (!context.hasInGlobalScope(this.id)) {
      const dispatch = (...args) => {
        store.dispatch(this.action(...args));
      };

      context.setForGlobalScope(this.id, dispatch);
    }

    return context.getFromGlobalScope(this.id);
  }
}

export type DispatchResolverParams = {
  <TActionArgs extends any[], TAction extends AnyAction>(actionCreator: (...args: TActionArgs) => TAction): Instance<
    (...args: TActionArgs) => void,
    [Store<any, any>]
  >;
};

export const dispatch: DispatchResolverParams = actionCreator => {
  return new DispatchResolver(actionCreator);
};
