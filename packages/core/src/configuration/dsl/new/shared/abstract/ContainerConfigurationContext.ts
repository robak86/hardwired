import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { BindingsRegistry } from '../../../../../context/BindingsRegistry.js';
import type { ICascadingDefinitionResolver } from '../../../../../container/IContainer.js';
import type { IDefinitionSymbol } from '../../../../../definitions/def-symbol.js';

import type { ConfigurationType, IConfigurationContext } from './IConfigurationContext.js';

export class ContainerConfigurationContext implements IConfigurationContext {
  static create(): ContainerConfigurationContext {
    return new ContainerConfigurationContext([], [], [], new Map(), new Map(), new Map(), new Map());
  }

  protected constructor(
    private _lazyDefinitionsRegister: ILazyDefinitionBuilder<unknown, LifeTime>[],
    private _lazyDefinitionsOverride: ILazyDefinitionBuilder<unknown, LifeTime>[],
    private _lazyDefinitionsFreeze: ILazyDefinitionBuilder<unknown, LifeTime>[],
    private _registerDefinitions: Map<symbol, IDefinition<any, any>>,
    private _overrideDefinitions: Map<symbol, IDefinition<any, any>>,
    private _freezeDefinitions: Map<symbol, IDefinition<any, any>>,
    private _cascadeDefinitions: Map<symbol, IDefinitionSymbol<any, LifeTime.cascading>>,
  ) {}

  onCascadingDefinition(definition: IDefinitionSymbol<unknown, LifeTime.cascading>): void {
    this._cascadeDefinitions.set(definition.id, definition);
  }

  onConfigureBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    switch (configType) {
      case 'add':
        this._lazyDefinitionsRegister.push(builder);
        break;
      case 'modify':
        this._lazyDefinitionsOverride.push(builder);
        break;
      case 'freeze':
        this._lazyDefinitionsFreeze.push(builder);
        break;
    }

    if (builder.symbol.strategy === LifeTime.cascading) {
      this._cascadeDefinitions.set(builder.symbol.id, builder.symbol as IDefinitionSymbol<unknown, LifeTime.cascading>);
    }
  }

  onDecorateBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    switch (configType) {
      case 'add':
        this._lazyDefinitionsRegister.push(builder);
        break;
      case 'modify':
        this._lazyDefinitionsOverride.push(builder);
        break;
      case 'freeze':
        this._lazyDefinitionsFreeze.push(builder);
        break;
    }

    if (builder.symbol.strategy === LifeTime.cascading) {
      this._cascadeDefinitions.set(builder.symbol.id, builder.symbol as IDefinitionSymbol<unknown, LifeTime.cascading>);
    }
  }

  onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void {
    if (this._overrideDefinitions.has(builder.symbol.id)) {
      throw new Error(`Cannot inherit from ${builder.symbol.toString()}. It is already modified in the current scope.`);
    }

    switch (configType) {
      case 'add':
        this._lazyDefinitionsRegister.push(builder);
        break;
      case 'modify':
        this._lazyDefinitionsOverride.push(builder);
        break;
      case 'freeze':
        this._lazyDefinitionsFreeze.push(builder);
        break;
    }
  }

  onDefinition(configType: ConfigurationType, definition: IDefinition<unknown, LifeTime>): void {
    switch (configType) {
      case 'add':
        this._registerDefinitions.set(definition.id, definition);
        break;
      case 'modify':
        if (definition.strategy === LifeTime.cascading) {
          this._cascadeDefinitions.set(definition.id, definition as IDefinitionSymbol<unknown, LifeTime.cascading>);
        }

        this._overrideDefinitions.set(definition.id, definition);
        break;
      case 'freeze':
        this._freezeDefinitions.set(definition.id, definition);
        break;
    }
  }

  applyBindings(bindingsRegistry: BindingsRegistry, container: ICascadingDefinitionResolver): void {
    this._registerDefinitions.forEach(definition => {
      bindingsRegistry.register(definition, definition, container);
    });

    this._overrideDefinitions.forEach(definition => {
      bindingsRegistry.override(definition);
    });

    this._lazyDefinitionsRegister.forEach(builder => {
      const def = builder.build(bindingsRegistry);

      bindingsRegistry.override(def);
    });

    this._lazyDefinitionsOverride.forEach(builder => {
      const def = builder.build(bindingsRegistry);

      bindingsRegistry.override(def);
    });

    this._freezeDefinitions.forEach(def => {
      bindingsRegistry.freeze(def);
    });

    this._cascadeDefinitions.forEach(symbol => {
      bindingsRegistry.setCascadeRoot(symbol, container);

      bindingsRegistry.override(bindingsRegistry.getDefinition(symbol));
    });
  }
}
