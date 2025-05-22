import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { IDefinitionSymbol } from '../../../../../definitions/def-symbol.js';

export type ConfigurationType = 'add' | 'modify' | 'freeze';

export interface IConfigurationContext {
  onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void;
  onDecorateBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void;
  onConfigureBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void;
  onDefinition(configType: ConfigurationType, definition: IDefinition<unknown, LifeTime>): void;
  onCascadingDefinition(
    configType: ConfigurationType,
    definition: IDefinitionSymbol<unknown, LifeTime.cascading>,
  ): void;
}
