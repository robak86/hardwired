import { BaseModuleBuilder, DefinitionsSet, ModuleRegistry } from '@hardwired/di-core';
import { commonDefines } from './builders/CommonDefines';

export class Module<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  // define<TKey extends string, TResolver extends DependencyResolver<TRegistry, any>>(
  //   key: TKey,
  //   // TODO: maybe we should call definer with some other class handling TRegistry than definitions set ?
  //   definer: (registry: DefinitionsSet<TRegistry>) => TResolver,
  // ): Module<
  //   {
  //     [K in keyof (TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<TResolver>> })]: (TRegistry &
  //       { [K in TKey]: Definition<DependencyResolverReturn<TResolver>> })[K];
  //   }
  // > {
  //   return new Module(this.registry.extendDeclarations(key, definer(this.registry)));
  // }
}

export function module<CTX = {}>(name: string) {
  return new Module<{}>(DefinitionsSet.empty(name)).using(commonDefines);

  // TODO: commonDefines could be split into smaller builders (traits like) and module could be composed using enhance
  // return new Module<{}>(DefinitionsSet.empty(name)).applyTrait((registry) => new CommonBuilder(registry));
  // return new Module<{}>(DefinitionsSet.empty(name)).applyTrait(CommonBuilder);
}

export const unit = module;
