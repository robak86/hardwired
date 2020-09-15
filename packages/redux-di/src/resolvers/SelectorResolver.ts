import { AbstractDependencyResolver, ContainerContext, DependencyFactory, ModuleLookup } from 'hardwired';
import { StoreResolver } from './StoreResolver';
import invariant from 'tiny-invariant';
import { AlterableStore } from '../stack/AlterableStore';

export class SelectorResolver<T> extends AbstractDependencyResolver<T> {
  private storeResolver: DependencyFactory<AlterableStore<any>>[] | [DependencyFactory<AlterableStore<any>>] = [];
  private hasSubscription = false;

  constructor(private select: () => T) {
    super();
  }

  build(context: ContainerContext): T {
    const storeInstance = this.storeResolver[0];
    const store = storeInstance.get(context);

    if (!this.hasSubscription) {
      // TODO: implement unsubscribe
      store.subscribe(() => {
        storeInstance.notifyInvalidated();
      });
      this.hasSubscription = true;
    }

    return context.getFromGlobalScope(this.id)(store.getState());
  }

  onInit(registry: ModuleLookup<any>): any {
    this.storeResolver = registry.findAncestorResolvers(StoreResolver);
    invariant(this.storeResolver.length === 1, `Multiple store instances are currently not supported`);
  }
}
