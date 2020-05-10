import { Definition, ModuleRegistry } from '../module/ModuleRegistry';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { NotDuplicated } from '../module/ModuleUtils';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';

type NextValueModule<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
  TKey,
  TRegistry,
  ValueModule<
    {
      [K in keyof (TRegistry & { [K in TKey]: Definition<TReturn> })]: (TRegistry &
        { [K in TKey]: Definition<TReturn> })[K];
    }
  >
>;

export class ValueModule<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  define<K extends string, V>(key: K, factory: V): NextValueModule<K, V, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new GlobalSingletonResolver(() => factory as any));

    return new ValueModule(newRegistry) as any;
  }

  protected build(ctx) {
    return new ValueModule(ctx) as any;
  }
}

export const value = <TRegistry extends ModuleRegistry>(registry: DefinitionsSet<TRegistry>): ValueModule<TRegistry> =>
  new ValueModule(registry);
