import { ContainerContext } from './ContainerContext';
import { Module } from '../resolvers/abstract/Module';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';
import { BuildStrategyFactory, ExtractBuildStrategyFactoryType } from '../strategies/abstract/BuildStrategy';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';
import invariant from 'tiny-invariant';

export class Container {
  constructor(
    private readonly containerContext: ContainerContext,
    private readonly overrides: ModulePatch<any>[],
    private readonly eager: Module<any>[],
  ) {
    eager.forEach(m => this.containerContext.eagerLoad(m));
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    return this.containerContext.get(moduleInstance, name);
  }

  getByStrategy<TValue, TStrategy extends BuildStrategyFactory<any, TValue>>(
    strategy: TStrategy,
  ): ExtractBuildStrategyFactoryType<TStrategy>[] {
    invariant(isStrategyTagged(strategy), `Cannot use given strategy for`);

    const expectedTag = getStrategyTag(strategy);
    const definitions = this.containerContext.filterLoadedResolvers(resolver => resolver.strategyTag === expectedTag);
    const context = this.containerContext.forNewRequest();
    return definitions.map(definition => {
      return this.containerContext.runResolver(definition, context);
    });
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    return this.containerContext.materializeModule(module, this.containerContext.forNewRequest());
  }

  usingNewRequestScope(): Container {
    return new Container(this.containerContext.forNewRequest(), [], []);
  }

  checkoutChildScope(...patches: ModulePatch<any>[]): Container {
    return new Container(this.containerContext.childScope(patches), [], []);
  }
}

// TODO: we need to have ability to provide patches which are not overridable by patches provided to nested scopes (testing!)
// or just clear distinction that patches provided to container are irreplaceable by patches provided to scopes
export type ContainerOptions = {
  overrides?: ModulePatch<any>[];
  eager?: Module<any>[];
  context?: ContainerContext;
};

// TODO: overrides are also eagerly loaded
// TODO: add runtime check for duplicates in eager, and overrides options
export function container({
  context = ContainerContext.empty(),
  overrides = [],
  eager = [], // TODO: eager means that modules are eagerly added to context (in order to enable reflection), but no instances are created. This may be confusing.
}: //       on the other hand how to create instances of definitions ? should we only create singletons ? what
//       about transient, request scopes. This would be pointless.
//       Probably we should not allow any reflection
// TODO: rename eager -> load|discoverable ? this could be use for instantiating definitions with some tag
ContainerOptions = {}): Container {
  const container = new Container(ContainerContext.withOverrides(overrides), overrides, eager);
  return container as any;
}
