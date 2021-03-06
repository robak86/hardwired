import { Module } from '../module/Module';
import { ModulePatch } from '../module/ModulePatch';
import { BuildStrategyFactory, ExtractBuildStrategyFactoryType } from '../strategies/abstract/BuildStrategy';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';
import invariant from 'tiny-invariant';
import { ContainerContext } from '../context/ContainerContext';
import { ContextService } from '../context/ContextService';
import { ContextLookup } from '../context/ContextLookup';
import { ContextScopes } from '../context/ContextScopes';
import { unwrapThunk } from '../utils/Thunk';

export type ChildScopeOptions = {
  scopeOverrides?: ModulePatch<any>[];
};

export class Container {
  constructor(protected readonly containerContext: ContainerContext) {}

  get id(): string {
    return this.containerContext.id;
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    const requestContext = ContextScopes.checkoutRequestScope(this.containerContext);
    return ContextService.get(moduleInstance, name, requestContext);
  }

  getSlice<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn {
    return inject(ContextScopes.checkoutRequestScope(this.containerContext));
  }

  __getByStrategy<TValue, TStrategy extends BuildStrategyFactory<any, TValue>>(
    strategy: TStrategy,
  ): ExtractBuildStrategyFactoryType<TStrategy>[] {
    invariant(isStrategyTagged(strategy), `Cannot use given strategy for`);

    const expectedTag = getStrategyTag(strategy);
    const definitions = ContextLookup.filterLoadedDefinitions(
      resolver => resolver.strategyTag === expectedTag,
      this.containerContext,
    );
    const context = ContextScopes.checkoutRequestScope(this.containerContext);

    return definitions.map(definition => {
      return ContextService.runInstanceDefinition(definition, context);
    });
  }

  __getByTag(tag: symbol): unknown[] {
    const context = ContextScopes.checkoutRequestScope(this.containerContext);
    return ContextService.runWithPredicate(
      definition => unwrapThunk(definition.resolverThunk).tags.includes(tag),
      context,
    );
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = ContextScopes.checkoutRequestScope(this.containerContext);
    return ContextService.materialize(module, requestContext);
  }

  asObjectMany<TModule extends Module<any>, TModules extends [TModule, ...TModule[]]>(
    ...modules: TModules
  ): Module.MaterializedArray<TModules> {
    const requestContext = ContextScopes.checkoutRequestScope(this.containerContext);
    return modules.map(module => {
      return ContextService.materialize(module, requestContext);
    }) as any;
  }

  /***
   * New container inherits current's container scopeOverrides, e.g. if current container has overrides for some singleton
   * then new scope will inherit this singleton unless one provides new overrides in options for this singleton.
   * Current containers instances build by "scoped" strategy are not inherited
   * @param options
   */
  checkoutScope(options: ChildScopeOptions = {}): Container {
    return new Container(ContextScopes.childScope(options, this.containerContext));
  }
}

export type ContainerOptions = {
  context?: ContainerContext;
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  scopeOverrides?: ModulePatch<any>[]; // used only in descendent scopes (can be overridden)
  globalOverrides?: ModulePatch<any>[]; // propagated to whole dependencies graph
  eager?: Module<any>[];
};

export function container({
  context,
  scopeOverrides = [],
  eager = [], // TODO: consider renaming to load|discoverable|preload - since eager may implicate that some instances are created
  globalOverrides = [],
}: ContainerOptions = {}): Container {
  const container = new Container(context || ContainerContext.create(eager, scopeOverrides, globalOverrides));
  return container as any;
}
