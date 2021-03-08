import { Module } from '../module/Module';
import { PatchedModule } from '../module/PatchedModule';
import { BuildStrategyFactory, ExtractBuildStrategyFactoryType } from '../strategies/abstract/BuildStrategy';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';
import invariant from 'tiny-invariant';
import { ContainerContext } from '../context/ContainerContext';
import { ContextService } from '../context/ContextService';
import { ContextLookup } from '../context/ContextLookup';
import { ContextScopes } from '../context/ContextScopes';

export class Container {
  constructor(private readonly containerContext: ContainerContext, private useProxy: boolean) {}

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
    if (this.useProxy) {
      return ContextService.materializeWithProxy(module, requestContext);
    } else {
      return ContextService.materialize(module, requestContext);
    }
  }

  // usingNewRequestScope(): Container {
  //   return new Container(this.containerContext.forNewRequest());
  // }

  checkoutChildScope(options: ContainerScopeOptions = {}): Container {
    return new Container(ContextScopes.childScope(options, this.containerContext), this.useProxy);
  }
}

// TODO: we need to have ability to provide patches which are not overridable by patches provided to nested scopes (testing!)
// or just clear distinction that patches provided to container are irreplaceable by patches provided to scopes
export type ContainerOptions = {
  context?: ContainerContext;
  useProxy?: boolean;
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  overrides?: PatchedModule<any>[];
  eager?: Module<any>[];
};

export function container({
  context,
  overrides = [],
  useProxy = true,
  eager = [], // TODO: consider renaming to load - since eager may implicate that some instances are created
}: ContainerOptions = {}): Container {
  const container = new Container(context || ContainerContext.create([...eager, ...overrides]), useProxy);
  return container as any;
}
