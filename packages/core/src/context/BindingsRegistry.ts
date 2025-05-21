import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../definitions/def-symbol.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ICascadingDefinitionResolver } from '../container/IContainer.js';
import type { IBindingsRegistryRead } from '../configuration/dsl/new/shared/AddDefinitionBuilder.js';

import { COWMap } from './COWMap.js';
import { ScopeRegistry } from './ScopeRegistry.js';

export interface IBindingRegistryRead {
  hasCascadingRoot(id: symbol): boolean;
}

export class BindingsRegistry implements IBindingRegistryRead, IBindingsRegistryRead {
  static create(): BindingsRegistry {
    return new BindingsRegistry(
      ScopeRegistry.create(),
      ScopeRegistry.create(),
      ScopeRegistry.create(),
      COWMap.create(),
      ScopeRegistry.create(),
      // new Map(),
      COWMap.create(),
    );
  }

  constructor(
    private _singletonDefinitions: ScopeRegistry<IDefinition<any, any>>,
    private _transientDefinitions: ScopeRegistry<IDefinition<any, any>>,
    private _scopeDefinitions: ScopeRegistry<IDefinition<any, any>>,
    private _frozenDefinitions: COWMap<IDefinition<any, any>>,
    private _cascadingDefinitions: ScopeRegistry<IDefinition<any, any>>, // registered cascading definitions, inherited

    private _cascadingRoots: COWMap<ICascadingDefinitionResolver>,
  ) {}

  hasCascadingRoot(id: symbol): boolean {
    return this._cascadingRoots.has(id);
  }

  getDefinitionForOverride<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> | undefined {
    if (symbol.strategy === LifeTime.cascading) {
      return this._cascadingDefinitions.getForOverride(symbol.id);
    }

    if (symbol.strategy === LifeTime.scoped) {
      return this._scopeDefinitions.getForOverride(symbol.id);
      // if (this._scopeDefinitions.hasOwn(symbol.id)) {
      //   return this._scopeDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>;
      // } else {
      //   const parentOwn = this._parent?.getDefinitionForOverride(symbol);
      //
      //   return parentOwn ?? (this._scopeDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>);
      // }
    }

    return this.getDefinition(symbol);
  }

  checkoutForScope(): BindingsRegistry {
    return new BindingsRegistry(
      this._singletonDefinitions,
      this._transientDefinitions.checkoutForScope(),
      this._scopeDefinitions.checkoutForScope(),
      this._frozenDefinitions.clone(),
      this._cascadingDefinitions.checkoutForScope(),
      this._cascadingRoots.clone(),
    );
  }

  register<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
    buildAware: ICascadingDefinitionResolver,
  ) {
    // TODO: replace this switch case with proper delegation/polymorphism
    switch (symbol.strategy) {
      case LifeTime.singleton:
        this.registerSingleton(symbol, definition);
        break;

      case LifeTime.scoped:
        this.addScopeBinding(symbol, definition);
        break;

      case LifeTime.transient:
        this.registerTransient(symbol, definition);
        break;

      case LifeTime.cascading:
        this.registerCascading(symbol, definition, buildAware);
        break;
    }
  }

  override(newDef: IDefinition<any, LifeTime>) {
    if (this._frozenDefinitions.has(newDef.id)) {
      return;
    }

    // TODO: replace this switch case with proper delegation/polymorphism
    switch (newDef.strategy) {
      case LifeTime.singleton:
        this.overrideSingleton(newDef);
        break;

      case LifeTime.scoped:
        this.overrideScoped(newDef);
        break;

      case LifeTime.transient:
        this.overrideTransient(newDef);
        break;

      case LifeTime.cascading:
        this.overrideCascading(newDef);
        break;
    }
  }

  getOwningContainer(defSymbol: IDefinitionSymbol<any, any>): ICascadingDefinitionResolver | undefined {
    return this._cascadingRoots.get(defSymbol.id);
  }

  setCascadeRoot(defSymbol: IDefinitionSymbol<any, LifeTime.cascading>, container: ICascadingDefinitionResolver) {
    const hasFrozenBinding = this._frozenDefinitions.has(defSymbol.id);

    if (hasFrozenBinding) {
      return;
    }

    const cascadingDefinition = this._cascadingDefinitions.get(defSymbol.id);

    this._cascadingRoots.set(defSymbol.id, container);
    this._cascadingDefinitions.override(defSymbol.id, cascadingDefinition);
  }

  getDefinition<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, any>,
  ): IDefinition<TInstance, TLifeTime> {
    //TODO: instead of probing all registries, we could switch by strategy
    const definition =
      (this._frozenDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._singletonDefinitions.find(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._transientDefinitions.find(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._scopeDefinitions.find(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._cascadingDefinitions.find(symbol.id) as IDefinition<TInstance, TLifeTime>);

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

  inheritsCascadingDefinition(definitionId: symbol): boolean {
    return (
      this._cascadingDefinitions.hasRegistration(definitionId) && !this._cascadingDefinitions.hasOverride(definitionId)
    );
  }

  private addFrozenBinding<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
  ) {
    if (this._frozenDefinitions.has(symbol.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }

    this._frozenDefinitions.set(symbol.id, definition);
  }

  addScopeBinding<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
  ) {
    this._scopeDefinitions.register(symbol.id, definition);
  }

  private registerSingleton<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
  ) {
    if (definition.strategy !== LifeTime.singleton) {
      throw new Error(`Cannot register singleton binding. The definition is not singleton.`);
    }

    this._singletonDefinitions.register(symbol.id, definition);
  }

  private registerTransient<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
  ) {
    if (definition.strategy !== LifeTime.transient) {
      throw new Error(`Cannot register transient binding. The definition is not transient.`);
    }

    this._transientDefinitions.register(symbol.id, definition);
  }

  private registerCascading<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
    buildAware: ICascadingDefinitionResolver,
  ) {
    if (symbol.strategy !== LifeTime.cascading) {
      throw new Error(`Cannot register singleton binding. The definition is not singleton.`);
    }

    this._cascadingDefinitions.register(symbol.id, definition);
    this._cascadingRoots.set(symbol.id, buildAware);
  }

  private overrideCascading<TInstance, TLifeTime extends LifeTime>(definition: IDefinition<TInstance, TLifeTime>) {
    if (!this._cascadingRoots.has(definition.id)) {
      throw new Error(
        `Cannot override cascading definition ${definition.toString()}.
        The registry is missing container that will be used as cascade root.`,
      );
    }

    this._cascadingDefinitions.override(definition.id, definition);
  }

  private overrideSingleton<TInstance, TLifeTime extends LifeTime>(definition: IDefinition<TInstance, TLifeTime>) {
    this._singletonDefinitions.override(definition.id, definition);
  }

  private overrideTransient<TInstance, TLifeTime extends LifeTime>(definition: IDefinition<TInstance, TLifeTime>) {
    this._transientDefinitions.override(definition.id, definition);
  }

  private overrideScoped<TInstance, TLifeTime extends LifeTime>(definition: IDefinition<TInstance, TLifeTime>) {
    this._scopeDefinitions.override(definition.id, definition);
  }

  freeze<TInstance, TLifetime extends LifeTime>(def: IDefinition<TInstance, TLifetime>) {
    this.addFrozenBinding(def, def);
  }
}
