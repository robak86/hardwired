import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../definitions/def-symbol.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { IContainer } from '../container/IContainer.js';

import { COWMap } from './COWMap.js';

export interface IBindingRegistryRead {
  hasFrozenBinding(definitionId: symbol): boolean;
  hasScopeDefinition(definitionId: symbol): boolean;
  hasCascadingDefinition(definitionId: symbol): boolean;
}

export class BindingsRegistry implements IBindingRegistryRead {
  static create(): BindingsRegistry {
    return new BindingsRegistry(
      COWMap.create(),
      COWMap.create(),
      COWMap.create(),
      COWMap.create(),
      COWMap.create(),
      new Map(),
      COWMap.create(),
    );
  }

  constructor(
    private _singletonDefinitions: COWMap<IDefinition<any, any>>,
    private _transientDefinitions: COWMap<IDefinition<any, any>>,
    private _scopeDefinitions: COWMap<IDefinition<any, any>>,
    private _frozenDefinitions: COWMap<IDefinition<any, any>>,
    private _cascadingDefinitions: COWMap<IDefinition<any, any>>,
    private _ownCascadingDefinitions: Map<symbol, IDefinition<any, any>>,
    private _owningScopes: COWMap<IContainer>,
  ) {}

  register<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
    buildAware: IContainer,
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
        this._owningScopes.set(symbol.id, buildAware);
        this.registerCascading(symbol, definition);
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

  getOwningContainer(defSymbol: IDefinitionSymbol<any, any>): IContainer | undefined {
    return this._owningScopes.get(defSymbol.id);
  }

  ownCascading(defSymbol: IDefinitionSymbol<any, LifeTime.cascading>, container: IContainer) {
    const hasFrozenBinding = this._frozenDefinitions.has(defSymbol.id);

    if (hasFrozenBinding) {
      return;
    }

    const cascadingDefinition = this._cascadingDefinitions.get(defSymbol.id);

    if (!cascadingDefinition) {
      throw new Error(
        `The scope cannot own cascading definition: ${defSymbol.toString()}. 
        The definition wasn't registered in parent or current scope.`,
      );
    }

    this._owningScopes.set(defSymbol.id, container);
    this._cascadingDefinitions.set(defSymbol.id, cascadingDefinition);
  }

  checkoutForScope(): BindingsRegistry {
    return new BindingsRegistry(
      this._singletonDefinitions,
      this._transientDefinitions,
      this._scopeDefinitions.clone(),
      this._frozenDefinitions.clone(),
      this._cascadingDefinitions.clone(),
      new Map(),
      this._owningScopes.clone(),
    );
  }

  getDefinition<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, any>,
  ): IDefinition<TInstance, TLifeTime> {
    const definition =
      (this._frozenDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._singletonDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._transientDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._scopeDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._cascadingDefinitions.get(symbol.id) as IDefinition<TInstance, TLifeTime>);

    if (!definition) {
      throw new Error(
        `Cannot find definition for ${symbol.toString()}. Make sure the definition symbol is registered.`,
      );
    }

    return definition;
  }

  // registerSingletonBinding<TInstance, TLifeTime extends LifeTime>(
  //   symbol: DefinitionSymbol<TInstance, TLifeTime>,
  //   definition: IDefinition<TInstance, TLifeTime>,
  // ) {
  //   if (this._singletonDefinitions.has(symbol.id)) {
  //     throw new Error(`Cannot bind singleton definition. The definition was already bound.`);
  //   }
  //
  //   this._singletonDefinitions.set(symbol.id, definition);
  // }

  hasFrozenBinding(definitionId: symbol): boolean {
    return this._frozenDefinitions.has(definitionId);
  }

  // getFrozenBinding<TInstance, TLifeTime extends LifeTime>(
  //   definition: IDefinitionSymbol<TInstance, TLifeTime>,
  // ): IDefinition<TInstance, TLifeTime> | undefined {
  //   return this._frozenDefinitions.get(definition.id);
  // }

  hasScopeDefinition(definitionId: symbol): boolean {
    return this._scopeDefinitions.has(definitionId);
  }

  inheritsCascadingDefinition(definitionId: symbol): boolean {
    return this._cascadingDefinitions.has(definitionId) && !this._ownCascadingDefinitions.has(definitionId);

    // return this._cascadingDefinitions.hasOwn(definitionId);
  }

  hasCascadingDefinition(definitionId: symbol): boolean {
    return this._cascadingDefinitions.has(definitionId);
  }

  addFrozenBinding<TInstance, TLifeTime extends LifeTime>(
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
    if (this._scopeDefinitions.hasOwn(symbol.id)) {
      throw new Error(
        `Cannot bind definition for the current scope. The scope has already other binding for the definition.`,
      );
    }

    this._scopeDefinitions.set(symbol.id, definition);
  }

  private registerSingleton<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
  ) {
    if (definition.strategy !== LifeTime.singleton) {
      throw new Error(`Cannot register singleton binding. The definition is not singleton.`);
    }

    if (this._singletonDefinitions.has(symbol.id)) {
      throw new Error(`Cannot bind singleton definition. The definition was already bound.`);
    }

    this._singletonDefinitions.set(symbol.id, definition);
  }

  private registerTransient<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    definition: IDefinition<TInstance, TLifeTime>,
  ) {
    if (definition.strategy !== LifeTime.transient) {
      throw new Error(`Cannot register transient binding. The definition is not transient.`);
    }

    if (this._transientDefinitions.has(symbol.id)) {
      throw new Error(`Cannot bind transient definition. The definition was already bound.`);
    }

    this._transientDefinitions.set(symbol.id, definition);
  }

  private registerCascading<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
    iDefinition: IDefinition<TInstance, TLifeTime>,
  ) {
    if (symbol.strategy !== LifeTime.cascading) {
      throw new Error(`Cannot register singleton binding. The definition is not singleton.`);
    }

    if (this._cascadingDefinitions.has(symbol.id)) {
      throw new Error(`Cannot bind cascading definition. The definition was already bound.`);
    }

    this._cascadingDefinitions.set(symbol.id, iDefinition);
    this._ownCascadingDefinitions.set(symbol.id, iDefinition);
  }

  private overrideCascading<TInstance, TLifeTime extends LifeTime>(definition: IDefinition<TInstance, TLifeTime>) {
    if (!this._cascadingDefinitions.has(definition.id)) {
      throw new Error(`Cannot override ${definition.toString()}. The definition was not registered.`);
    }

    this._cascadingDefinitions.set(definition.id, definition);
    this._ownCascadingDefinitions.set(definition.id, definition);
  }

  private overrideSingleton<TInstance, TLifeTime extends LifeTime>(definition: IDefinition<TInstance, TLifeTime>) {
    if (!this._singletonDefinitions.has(definition.id) && !this._frozenDefinitions.has(definition.id)) {
      throw new Error(`Cannot override ${definition.toString()}. The definition was not registered.`);
    }

    this._singletonDefinitions.set(definition.id, definition);
  }

  private overrideTransient<TInstance, TLifeTime extends LifeTime>(definition: IDefinition<TInstance, TLifeTime>) {
    if (this._transientDefinitions.has(definition.id) && !this._frozenDefinitions.has(definition.id)) {
      throw new Error(`Cannot bind transient definition. The definition was already bound.`);
    }

    this._transientDefinitions.set(definition.id, definition);
  }

  private overrideScoped<TInstance, TLifeTime extends LifeTime>(definition: IDefinition<TInstance, TLifeTime>) {
    if (!this._scopeDefinitions.has(definition.id) && !this._frozenDefinitions.has(definition.id)) {
      throw new Error(`Cannot override ${definition.toString()}. The definition was not registered.`);
    }

    this._scopeDefinitions.set(definition.id, definition);
  }

  freeze<TInstance, TLifetime extends LifeTime>(def: IDefinition<TInstance, TLifetime>) {
    this.addFrozenBinding(def, def);
  }
}
