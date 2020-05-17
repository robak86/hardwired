import { Definition, MaterializedModuleEntries, ModuleRegistry } from '../module/ModuleRegistry';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { NotDuplicated } from '../module/ModuleUtils';
import { TransientResolver } from '../resolvers/TransientResolver';

type NextTransientModule<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
  TKey,
  TRegistry,
  TransientModule<
    {
      [K in keyof (TRegistry & { [K in TKey]: Definition<TReturn> })]: (TRegistry &
        { [K in TKey]: Definition<TReturn> })[K];
    }
  >
>;

export class TransientModule<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {



  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  define<K extends string, V>(
    key: K,
    factory: (container: MaterializedModuleEntries<TRegistry>) => V, // TODO: its unclear if this single override shouldn't be exposed in the api
  ): NextTransientModule<K, V, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new TransientResolver(factory as any));

    return new TransientModule(newRegistry) as any;
  }

  protected build(ctx) {
    return new TransientModule(ctx) as any;
  }
}

export const transient = <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): TransientModule<TRegistry> => new TransientModule(registry);
