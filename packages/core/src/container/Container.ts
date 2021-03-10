import { Module } from '../module/Module';
import { ModulePatch } from '../module/ModulePatch';
import { BuildStrategyFactory, ExtractBuildStrategyFactoryType } from '../strategies/abstract/BuildStrategy';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';
import invariant from 'tiny-invariant';
import { ContainerContext } from '../context/ContainerContext';
import { ContextService } from '../context/ContextService';
import { ContextLookup } from '../context/ContextLookup';
import { ContextScopes } from '../context/ContextScopes';

export type ChildScopeOptions = {
  overrides?: ModulePatch<any>[];
};

export class Container {
  constructor(private readonly containerContext: ContainerContext) {}

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

  // TODO: remove
  getByStrategy<TValue, TStrategy extends BuildStrategyFactory<any, TValue>>(
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

  // getByTag(tag: symbol): unknown[] {
  //   const context = this.containerContext.forNewRequest();
  //   return this.containerContext.runWithPredicate(
  //     definition => unwrapThunk(definition.resolverThunk).tags.includes(tag),
  //     context,
  //   );
  // }

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

  checkoutChildScope(options: ChildScopeOptions = {}): Container {
    return new Container(ContextScopes.childScope(options, this.containerContext));
  }
}

// TODO: we need to have ability to provide patches which are not overridable by patches provided to nested scopes (testing!)
// or just clear distinction that patches provided to container are irreplaceable by patches provided to scopes
export type ContainerOptions = {
  context?: ContainerContext;
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  overrides?: ModulePatch<any>[]; // TODO: container probably don't requires overrides which can by overriden by child scopes
  eager?: Module<any>[];
  invariants?: ModulePatch<any>[];
};

export function container({
  context,
  overrides = [],
  eager = [], // TODO: consider renaming to load|discoverable|preload - since eager may implicate that some instances are created
  invariants = [],
}: ContainerOptions = {}): Container {
  const container = new Container(context || ContainerContext.create(eager, overrides, invariants));
  return container as any;
}
