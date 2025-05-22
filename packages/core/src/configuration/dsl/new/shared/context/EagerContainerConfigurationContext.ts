import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { BindingsRegistry } from '../../../../../context/BindingsRegistry.js';
import type { IDefinitionSymbol } from '../../../../../definitions/def-symbol.js';
import type { InstancesStore } from '../../../../../context/InstancesStore.js';
import type { ConfigurationType, IConfigurationContext } from '../abstract/IConfigurationContext.js';

export class EagerContainerConfigurationContext implements IConfigurationContext {
  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private instancesStore: InstancesStore,
  ) {}

  onCascadingDefinition(_definition: IDefinitionSymbol<unknown, LifeTime.cascading>): void {
    throw new Error('Cascading definitions are not supported in eager mode.');
  }

  onConfigureBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    const def = builder.build(this._bindingsRegistry);

    this.onDefinition(configType, def);
  }

  onDecorateBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    const def = builder.build(this._bindingsRegistry);

    this.onDefinition(configType, def);
  }

  onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void {
    const def = builder.build(this._bindingsRegistry);

    this.onDefinition(configType, def);
  }

  onDefinition(_configType: ConfigurationType, definition: IDefinition<unknown, LifeTime>): void {
    if (this.instancesStore.hasInherited(definition)) {
      throw new Error(
        `Cannot freeze binding ${definition.toString()} because it is already instantiated in some higher scope.`,
      );
    }

    if (this.instancesStore.has(definition)) {
      throw new Error(`Cannot freeze binding ${definition.toString()} because it is already instantiated.`);
    }

    this._bindingsRegistry.freeze(definition);
  }
}
