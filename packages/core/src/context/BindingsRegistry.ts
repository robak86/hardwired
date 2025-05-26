import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { IDefinitionToken } from '../definitions/tokens.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ICascadingDefinitionResolver } from '../container/IContainer.js';
import type { IBindingsRegistryConfiguration } from '../configuration/dsl/new/container/ContainerConfiguration.js';
import type { ILazyDefinitionBuilder } from '../configuration/dsl/new/utils/abstract/ILazyDefinitionBuilder.js';

import type { IReadonlyScopeRegistry } from './ScopeRegistry.js';
import { ScopeRegistry } from './ScopeRegistry.js';
import type { IBindingsRegistryRead } from './abstract/IBindingsRegistryRead.js';
import { LazyDefinitionsRegistry } from './LazyDefinitionsRegistry.js';

export class BindingsRegistry implements IBindingsRegistryRead {
  static create(configs: IBindingsRegistryConfiguration[]): BindingsRegistry {
    const definitions = ScopeRegistry.root(configs.map(c => c.definitions));
    const frozenDefinitions = ScopeRegistry.root(configs.map(c => c.frozenDefinitions));
    const lazyDefinitions = LazyDefinitionsRegistry.root(configs.map(c => c.lazyDefinitions));

    // const cascadingTokens = new Set<IDefinitionToken<any, LifeTime.cascading>>(
    //   configs.flatMap(c => Array.from(c.cascadingTokens)),
    // );

    return new BindingsRegistry(frozenDefinitions, definitions, lazyDefinitions);
  }

  constructor(
    private _frozenDefinitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
    private _definitions: IReadonlyScopeRegistry<IDefinition<unknown, LifeTime>>,

    private _lazyDefinitions: LazyDefinitionsRegistry,
    // private _cascadingTokens: Set<IDefinitionToken<any, LifeTime.cascading>>,
  ) {}

  applyConfig(config: IBindingsRegistryConfiguration, container: ICascadingDefinitionResolver) {
    // config.definitions.forEach(definition => {
    //   this.register(definition, definition, container);
    // });
    // TODO: don't copy all definitions. Just link them.
    // this._definitions = config.definitions.withParent(this._definitions, false);
    // config.frozenDefinitions.forEach(def => {
    //   this.freeze(def);
    // });
    //! lazy
    // config.lazyDefinitions.forEach(builder => {
    //   const def = builder.build(this);
    //
    //   this.override(def);
    // });
    //! lazy
    // config.frozenLazyDefinitions.forEach(def => {
    //   const frozenDef = def.build(this);
    //
    //   this.freeze(frozenDef);
    // });
    //! lazy
    // config.cascadingTokens.forEach(token => {
    //   this.setCascadeRoot(token, container);
    //
    //   if (token instanceof AbstractDefinition) {
    //     this.override(token);
    //   } else {
    //     this.override(this.getDefinition(token));
    //   }
    // });
  }

  // hasCascadingRoot(id: symbol): boolean {
  //   return this._cascadingRoots.has(id);
  // }
  //
  // hasOwnCascadingRoot(id: symbol): boolean {
  //   return this._cascadingRoots.hasOwn(id);
  // }
  //
  // setCascadeRoot(defSymbol: IDefinitionToken<any, LifeTime.cascading>, container: ICascadingDefinitionResolver) {
  //   this._cascadingRoots.set(defSymbol.id, container);
  // }
  //
  // getOwningContainer(defSymbol: IDefinitionToken<any, any>): ICascadingDefinitionResolver | undefined {
  //   return this._cascadingRoots.get(defSymbol.id);
  // }

  getForOverride<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    return this._definitions.getForOverride(symbol.id) as IDefinition<TInstance, TLifeTime>;
  }

  checkoutForScope(configs: IBindingsRegistryConfiguration[]): BindingsRegistry {
    // const cascadingTokens = new Set<IDefinitionToken<any, LifeTime.cascading>>(
    //   configs.flatMap(c => Array.from(c.cascadingTokens)),
    // );

    return new BindingsRegistry(
      this._frozenDefinitions.checkoutScope(configs.map(c => c.frozenDefinitions)),
      this._definitions.checkoutScope(configs.map(c => c.definitions)),
      // this._cascadingRoots.clone(),
      this._lazyDefinitions.checkoutScope(configs.map(c => c.lazyDefinitions)),
      // cascadingTokens,
    );
  }

  // register<TInstance, TLifeTime extends LifeTime>(
  //   symbol: IDefinitionToken<TInstance, TLifeTime>,
  //   definition: IDefinition<TInstance, TLifeTime>,
  //   buildAware: ICascadingDefinitionResolver,
  // ) {
  //   if (symbol.strategy === LifeTime.cascading) {
  //     this._cascadingRoots.set(symbol.id, buildAware);
  //   }
  //
  //   this._definitions.append(symbol.id, definition);
  // }

  // override(definition: IDefinition<any, LifeTime>) {
  //   if (this._frozenDefinitions.has(definition.id)) {
  //     return;
  //   }
  //
  //   if (definition.strategy === LifeTime.cascading && !this._cascadingRoots.has(definition.id)) {
  //     throw new Error(
  //       `Cannot override cascading definition ${definition.toString()}.
  //       The registry is missing container that will be used as cascade root.`,
  //     );
  //   }
  //
  //   this._definitions.override(definition.id, definition);
  // }

  findDefinition<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    const definition =
      (this._frozenDefinitions.find(token.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._definitions.find(token.id) as IDefinition<TInstance, TLifeTime>);

    if (definition && this._lazyDefinitions.has(token.id)) {
      return this._lazyDefinitions.apply(definition);
    }

    return definition;
  }

  getDefinition<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    const definition = this.findDefinition(symbol);

    if (!definition) {
      throw new Error(
        `Cannot find definition for ${symbol.toString()}. Make sure the definition symbol is registered.`,
      );
    }

    return definition;
  }

  hasFrozenBinding(definitionId: symbol): boolean {
    return this._frozenDefinitions.has(definitionId);
  }

  freeze<TInstance, TLifetime extends LifeTime>(def: IDefinition<TInstance, TLifetime>) {
    if (this._frozenDefinitions.has(def.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }

    this._frozenDefinitions.register(def.id, def);
  }

  appendLazyDefinition(_definition: ILazyDefinitionBuilder<unknown, LifeTime>) {
    this._lazyDefinitions.append(_definition);
  }
}
