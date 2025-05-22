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
