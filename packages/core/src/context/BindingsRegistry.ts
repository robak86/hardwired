import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { DefinitionSymbol, IDefinitionToken } from '../definitions/def-symbol.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ICascadingDefinitionResolver } from '../container/IContainer.js';
import type { IBindingsRegistryConfiguration } from '../configuration/dsl/new/container/ContainerConfiguration.js';

import { COWMap } from './COWMap.js';
import { ScopeRegistry } from './ScopeRegistry.js';
import type { ICascadeRootsRegistry } from './abstract/ICascadeRootsRegistry.js';
import type { IBindingsRegistryRead } from './abstract/IBindingsRegistryRead.js';

export class BindingsRegistry implements IBindingsRegistryRead, ICascadeRootsRegistry {
  static create(): BindingsRegistry {
    return new BindingsRegistry(
      COWMap.create(),
      ScopeRegistry.create((def: IDefinition<unknown, LifeTime>) => def.token.strategy),
      COWMap.create(),
    );
  }

  constructor(
    private _frozenDefinitions: COWMap<IDefinition<unknown, LifeTime>>,
    private _definitions: ScopeRegistry<IDefinition<unknown, LifeTime>, LifeTime>,
    private _cascadingRoots: COWMap<ICascadingDefinitionResolver>,
  ) {}

  applyConfig(config: IBindingsRegistryConfiguration, container: ICascadingDefinitionResolver) {
    config.definitions.forEach(definition => {
      this.register(definition.token, definition, container);
    });

    // TODO: don't copy all definitions. Just link them.
    // this._definitions = config.definitions.withParent(this._definitions, false);

    config.frozenDefinitions.forEach(def => {
      this.freeze(def);
    });

    //! lazy
    config.lazyDefinitions.forEach(builder => {
      const def = builder.build(this);

      this.override(def);
    });

    //! lazy
    config.frozenLazyDefinitions.forEach(def => {
      const frozenDef = def.build(this);

      this.freeze(frozenDef);
    });

    //! lazy
    config.cascadingTokens.forEach(symbol => {
      this.setCascadeRoot(symbol, container);

      this.override(this.getDefinition(symbol));
    });
  }

  hasCascadingRoot(id: symbol): boolean {
    return this._cascadingRoots.hasOwn(id);
  }

  setCascadeRoot(defSymbol: IDefinitionToken<any, LifeTime.cascading>, container: ICascadingDefinitionResolver) {
    this._cascadingRoots.set(defSymbol.id, container);
  }

  getOwningContainer(defSymbol: IDefinitionToken<any, any>): ICascadingDefinitionResolver | undefined {
    return this._cascadingRoots.get(defSymbol.id);
  }

  getForOverride<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    return this._definitions.getForOverride(symbol.id) as IDefinition<TInstance, TLifeTime>;
  }

  checkoutForScope(): BindingsRegistry {
    return new BindingsRegistry(
      this._frozenDefinitions.clone(),
      this._definitions.checkoutForScope(),
      this._cascadingRoots.clone(),
    );
  }

  register<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
    buildAware: ICascadingDefinitionResolver,
  ) {
    if (symbol.strategy === LifeTime.cascading) {
      this._cascadingRoots.set(symbol.id, buildAware);
    }

    this._definitions.append(symbol.id, definition);
  }

  override(definition: IDefinition<any, LifeTime>) {
    if (this._frozenDefinitions.has(definition.id)) {
      return;
    }

    if (definition.strategy === LifeTime.cascading && !this._cascadingRoots.has(definition.id)) {
      throw new Error(
        `Cannot override cascading definition ${definition.toString()}.
        The registry is missing container that will be used as cascade root.`,
      );
    }

    this._definitions.override(definition.id, definition);
  }

  getDefinition<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, any>,
  ): IDefinition<TInstance, TLifeTime> {
    const definition =
      (this._frozenDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._definitions.find(symbol.id) as IDefinition<TInstance, TLifeTime>);

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

    this._frozenDefinitions.set(def.id, def);
  }
}
