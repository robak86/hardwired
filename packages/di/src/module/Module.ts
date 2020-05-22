import { DefinitionsSet } from './DefinitionsSet';
import { Definition, ModuleRegistry } from './ModuleRegistry';
import { BaseModuleBuilder } from '../builders/BaseModuleBuilder';
import { DependencyResolver } from '..';
import { DependencyResolverReturn } from '../resolvers/DependencyResolver';

export class Module<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  define<TKey extends string, TResolver extends DependencyResolver<TRegistry, any>>(
    key: TKey,
    // TODO: maybe we should call definer with some other class handling TRegistry than definitions set ?
    definer: (registry: DefinitionsSet<TRegistry>) => TResolver,
  ): Module<
    {
      [K in keyof (TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<TResolver>> })]: (TRegistry &
        { [K in TKey]: Definition<DependencyResolverReturn<TResolver>> })[K];
    }
  > {
    return new Module(this.registry.extendDeclarations(key, definer(this.registry)));
  }

  protected build<TNextBuilder extends this>(ctx: any): TNextBuilder {
    return new Module(ctx) as any;
  }
}

export function module<CTX = {}>(name: string): Module<{}> {
  return new Module(DefinitionsSet.empty(name));
}
