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
    definer: (registry: TRegistry) => TResolver,
  ): Module<TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<TResolver>> }> {
    throw new Error('Implement me');
  }

  protected build<TNextBuilder extends this>(ctx: any): TNextBuilder {
    return new Module(ctx) as any;
  }
}

export function module<CTX = {}>(name: string): Module<{}> {
  return new Module(DefinitionsSet.empty(name));
}
