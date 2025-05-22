import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { BindingsRegistry } from '../../../../../context/BindingsRegistry.js';
import { type ICascadingDefinitionResolver } from '../../../../../container/IContainer.js';

export interface IConfigurationContext {
  onInheritBuilder(builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void;
  onDecorateBuilder(builder: ILazyDefinitionBuilder<unknown, LifeTime>): void;
  onConfigureBuilder(builder: ILazyDefinitionBuilder<unknown, LifeTime>): void;
  onDefinition(definition: IDefinition<unknown, LifeTime>): void;
  onCascadingDefinition(definition: IDefinition<unknown, LifeTime.cascading>): void;

  asModify(): IConfigurationContext;

  applyBindings(bindingsRegistry: BindingsRegistry, container: ICascadingDefinitionResolver): void;
}

export class ContainerConfigurationContext implements IConfigurationContext {
  static forAdding(): ContainerConfigurationContext {
    return new ContainerConfigurationContext(false, [], [], new Map(), new Map(), new Map());
  }

  constructor(
    private _asOverride: boolean,
    private _lazyDefinitionsRegister: ILazyDefinitionBuilder<unknown, LifeTime>[],
    private _lazyDefinitionsOverride: ILazyDefinitionBuilder<unknown, LifeTime>[],
    private _registerDefinitions: Map<symbol, IDefinition<any, any>>,
    private _overrideDefinitions: Map<symbol, IDefinition<any, any>>,
    private _cascadeDefinitions: Map<symbol, IDefinition<any, LifeTime.cascading>>,
  ) {}

  onCascadingDefinition(definition: IDefinition<unknown, LifeTime.cascading>): void {
    this._cascadeDefinitions.set(definition.id, definition);
  }

  onConfigureBuilder(builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    if (this._asOverride) {
      this._lazyDefinitionsOverride.push(builder);
    } else {
      this._lazyDefinitionsRegister.push(builder);
    }
  }

  onDecorateBuilder(builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    if (this._asOverride) {
      this._lazyDefinitionsOverride.push(builder);
    } else {
      this._lazyDefinitionsRegister.push(builder);
    }
  }

  onInheritBuilder(builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void {
    if (this._asOverride) {
      this._lazyDefinitionsOverride.push(builder);
    } else {
      this._lazyDefinitionsRegister.push(builder);
    }
  }

  onDefinition(definition: IDefinition<unknown, LifeTime>): void {
    if (this._asOverride) {
      this._overrideDefinitions.set(definition.id, definition);
    } else {
      this._registerDefinitions.set(definition.id, definition);
    }
  }

  asModify(): IConfigurationContext {
    return new ContainerConfigurationContext(
      true,
      this._lazyDefinitionsOverride,
      this._lazyDefinitionsRegister,
      this._overrideDefinitions,
      this._registerDefinitions,
      this._cascadeDefinitions,
    );
  }

  applyBindings(bindingsRegistry: BindingsRegistry, container: ICascadingDefinitionResolver): void {
    this._registerDefinitions.forEach(definition => {
      bindingsRegistry.register(definition, definition, container);
    });

    this._overrideDefinitions.forEach(definition => {
      bindingsRegistry.override(definition);
    });

    this._lazyDefinitionsRegister.forEach(builder => {
      builder.build(bindingsRegistry);
    });

    this._lazyDefinitionsOverride.forEach(builder => {
      builder.build(bindingsRegistry);
    });

    this._cascadeDefinitions.forEach(definition => {
      bindingsRegistry.setCascadeRoot(definition, container);
      bindingsRegistry.override(definition);
    });
  }
}
