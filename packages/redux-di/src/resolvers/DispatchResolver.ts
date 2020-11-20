import { AbstractDependencyResolver, ContainerContext, Instance, ModuleLookup } from 'hardwired';
import { Action } from 'redux';
import { StoreResolver } from './StoreResolver';
import invariant from 'tiny-invariant';
import { AlterableStore } from '../stack/AlterableStore';

export class DispatchResolver<TActionArgs extends any[]> extends AbstractDependencyResolver<(...TActionArgs) => void> {
  private storeResolver: Instance<AlterableStore<any>>[] | [Instance<AlterableStore<any>>] = [];

  constructor(private action: (...args: any) => Action) {
    super();
  }

  onInit(registry: ModuleLookup<any>): any {
    this.storeResolver = registry.findAncestorResolvers(StoreResolver);
    invariant(this.storeResolver.length === 1, `Multiple store instances are currently not supported`);
  }

  build(context: ContainerContext): any {
    const storeInstance = this.storeResolver[0];
    const store = storeInstance.get(context);

    return (...args) => {
      store.dispatch(this.action(...args));
    };
  }
}

export type DispatchResolverParams<TAction extends Action> = {
  <TActionArgs extends any[]>(actionCreator: (...args: TActionArgs) => TAction): DispatchResolver<any>;
};

export const dispatch: DispatchResolverParams<Action> = actionCreator => {
  return new DispatchResolver(actionCreator);
};
