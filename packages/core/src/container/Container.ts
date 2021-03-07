import { ContainerContext } from './ContainerContext';
import { Module } from '../resolvers/abstract/Module';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';
import { BuildStrategyFactory, ExtractBuildStrategyFactoryType } from '../strategies/abstract/BuildStrategy';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';
import invariant from 'tiny-invariant';
import { unwrapThunk } from '../utils/Thunk';
import { ContextRecord } from './ContainerContextStorage';
import { ContextService } from './ContextService';
import { ContextLookup } from './ContextLookup';

export class Container {
  constructor(
    private readonly containerContext: ContextRecord, // private readonly overrides: ModulePatch<any>[], // private readonly eager: Module<any>[],
  ) {
    // this.containerContext = new ContainerContext(ContextRecord.create(eager))
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    const requestContext = ContextRecord.checkoutRequestScope(this.containerContext);
    return ContextService.get(moduleInstance, name, requestContext);
  }

  getSlice<TReturn>(inject: (ctx: ContextRecord) => TReturn): TReturn {
    return inject(ContextRecord.checkoutRequestScope(this.containerContext));
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
    const context = ContextRecord.checkoutRequestScope(this.containerContext);

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
    const requestContext = ContextRecord.checkoutRequestScope(this.containerContext);
    return ContextService.materializeModule(module, requestContext);
  }

  // usingNewRequestScope(): Container {
  //   return new Container(this.containerContext.forNewRequest());
  // }

  checkoutChildScope(options: ContainerScopeOptions = {}): Container {
    return new Container(ContextRecord.childScope(options, this.containerContext));
  }

  getContext(): ContextRecord {
    return this.containerContext;
  }
}

// TODO: we need to have ability to provide patches which are not overridable by patches provided to nested scopes (testing!)
// or just clear distinction that patches provided to container are irreplaceable by patches provided to scopes
export type ContainerOptions = {
  context?: ContextRecord;
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
  const container = new Container(context || ContextRecord.create([...eager, ...overrides]));
  return container as any;
}
