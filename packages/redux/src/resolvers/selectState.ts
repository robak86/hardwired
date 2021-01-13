import { AcquiredInstance, ContainerContext, Instance } from 'hardwired';
import { Store } from 'redux';
import invariant from 'tiny-invariant';

export class StateSelector<T, TDeps extends any[]> extends Instance<T, TDeps> {
  constructor(private select: () => T) {
    super();
  }

  build(context: ContainerContext): T {
    const store = this.getStore(context);
    return store.getState();
  }

  acquire(context: ContainerContext): AcquiredInstance<T> {
    return new AcquiredSelector(this.id, context, this.getStore(context), this.build.bind(this));
  }

  getStore(context: ContainerContext): Store<any> {
    const [storeResolver, ...selectorsResolvers] = this.dependencies;
    invariant(storeResolver, `Missing store dependency`);

    return storeResolver.build(context);
  }
}

export class AcquiredSelector<TValue> extends AcquiredInstance<TValue> {
  private unsubscribe?: Function;

  constructor(
    protected resolverId: string,
    protected containerContext,
    private store: Store<any>,
    private select: (containerContext: ContainerContext) => TValue,
  ) {
    super(resolverId, containerContext);

    this.unsubscribe = this.store.subscribe(() => {
      this.instanceEvents.invalidateEvents.emit();
    });
  }

  dispose() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.instanceEvents.clearAll();
  }

  get(): TValue {
    return this.select(this.containerContext);
  }
}

export type SelectorResolverBuildFn = {
  <TState>(): StateSelector<TState, [Store<TState>]>;
};

export const selectState: SelectorResolverBuildFn = () => {
  throw new Error('Implement me');
  // return new SelectorResolver(null as any) as any;
};
