import { ContainerContext } from './ContainerContext';
import { Module } from '../resolvers/abstract/Module';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';
import { BuildStrategyFactory, ExtractBuildStrategyFactoryType } from '../strategies/abstract/BuildStrategy';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';
import invariant from 'tiny-invariant';
import { unwrapThunk } from '../utils/Thunk';
import { ContextRecord } from './ContainerContextStorage';

export class Container {
  constructor(
    private readonly containerContext: ContainerContext, // private readonly overrides: ModulePatch<any>[],
  ) // private readonly eager: Module<any>[],
  {
    // this.containerContext = new ContainerContext(ContextRecord.create(eager))
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    return this.containerContext.get(moduleInstance, name);
  }

  getSlice<TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn {
    return inject(this.containerContext.forNewRequest());
  }

  // TODO: remove
  getByStrategy<TValue, TStrategy extends BuildStrategyFactory<any, TValue>>(
    strategy: TStrategy,
  ): ExtractBuildStrategyFactoryType<TStrategy>[] {
    invariant(isStrategyTagged(strategy), `Cannot use given strategy for`);

    const expectedTag = getStrategyTag(strategy);
    const definitions = this.containerContext.filterLoadedDefinitions(resolver => resolver.strategyTag === expectedTag);
    const context = this.containerContext.forNewRequest();
    return definitions.map(definition => {
      return this.containerContext.runInstanceDefinition(definition, context);
    });
  }

  getByTag(tag: symbol): unknown[] {
    const context = this.containerContext.forNewRequest();
    return this.containerContext.runWithPredicate(
      definition => unwrapThunk(definition.resolverThunk).tags.includes(tag),
      context,
    );
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    return this.containerContext.materializeModule(module, this.containerContext.forNewRequest());
  }

  usingNewRequestScope(): Container {
    return new Container(this.containerContext.forNewRequest());
  }

  checkoutChildScope(options: ContainerScopeOptions = {}): Container {
    return new Container(this.containerContext.childScope(options));
  }

  getContext(): ContainerContext {
    return this.containerContext;
  }
}

// TODO: we need to have ability to provide patches which are not overridable by patches provided to nested scopes (testing!)
// or just clear distinction that patches provided to container are irreplaceable by patches provided to scopes
export type ContainerOptions = {
  context?: ContainerContext;
} & ContainerScopeOptions;

export type ContainerScopeOptions = {
  overrides?: ModulePatch<any>[];
  eager?: Module<any>[];
};

export function container({
  context,
  overrides = [],
  eager = [], // TODO: consider renaming to load - since eager may implicate that some instances are created
}: ContainerOptions = {}): Container {
  const container = new Container(context || ContainerContext.withOverrides([...eager, ...overrides]));
  return container as any;
}
