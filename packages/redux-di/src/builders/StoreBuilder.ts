import {
  BaseModuleBuilder,
  Definition,
  DefinitionsSet,
  GlobalSingletonResolver,
  MaterializedModuleEntries,
  ModuleRegistry,
} from '@hardwired/di';
import { StoreInstance } from '../StoreInstance';

export class StoreBuilder<TRegistry extends ModuleRegistry, TState> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  define<TKey extends string>(
    key: TKey,
    defaultsState: (ctx: MaterializedModuleEntries<TRegistry>) => TState,
  ): StoreBuilder<TRegistry & { [K in TKey]: Definition<StoreInstance<any>> }, TState> {
    const newRegistry = this.registry.extendDeclarations(
      key,
      new GlobalSingletonResolver<TRegistry, StoreInstance<TState>>(ctx => new StoreInstance(defaultsState(ctx))),
    );
    return this.build(newRegistry);
  }

  protected build(ctx: DefinitionsSet<any>): StoreBuilder<any, TState> {
    return new StoreBuilder(ctx);
  }
}

export const storeDefines = <TState>() => <TRegistry extends ModuleRegistry>(
  ctx: DefinitionsSet<TRegistry>,
): StoreBuilder<TRegistry, TState> => {
  return new StoreBuilder(ctx);
};
