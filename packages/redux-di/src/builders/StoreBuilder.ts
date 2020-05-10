import { BaseModuleBuilder, ModuleRegistry } from '@hardwired/di';
import { DefinitionsSet } from '../../../di/src/module/DefinitionsSet';
import { Definition, MaterializedModuleEntries } from '../../../di/src/module/ModuleRegistry';
import { StoreInstance } from '../StoreInstance';
import { GlobalSingletonResolver } from '../../../di/src/resolvers/global-singleton-resolver';

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

const stateDefines = <TState>() => <TRegistry extends ModuleRegistry>(
  ctx: DefinitionsSet<TRegistry>,
): StoreBuilder<TRegistry, TState> => {
  return new StoreBuilder(ctx);
};
