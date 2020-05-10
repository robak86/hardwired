import { Definition, MaterializedModuleEntries, ModuleRegistry } from '../module/ModuleRegistry';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { NotDuplicated } from '../module/ModuleUtils';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';

type NextSingletonBuilder<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
  TKey,
  TRegistry,
  SingletonBuilder<
    {
      [K in keyof (TRegistry & { [K in TKey]: Definition<TReturn> })]: (TRegistry &
        { [K in TKey]: Definition<TReturn> })[K];
    }
  >
>;

export class SingletonBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  define<K extends string, V>(
    key: K,
    factory: (container: MaterializedModuleEntries<TRegistry>) => V, // TODO: its unclear if this single override shouldn't be exposed in the api
  ): NextSingletonBuilder<K, V, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new GlobalSingletonResolver(factory as any));

    return new SingletonBuilder(newRegistry) as any;
  }

  protected build(ctx) {
    return new SingletonBuilder(ctx) as any;
  }
}

export const singleton = <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): SingletonBuilder<TRegistry> => new SingletonBuilder(registry);
