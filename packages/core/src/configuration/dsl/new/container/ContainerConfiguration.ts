import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { ICascadingDefinitionResolver } from '../../../../container/IContainer.js';
import type { ConfigurationBuildersContext } from '../shared/context/ConfigurationBuildersContext.js';

export interface IContainerConfiguration {
  apply(bindingsRegistry: BindingsRegistry, container: ICascadingDefinitionResolver): void;
}

export class ContainerConfiguration implements IContainerConfiguration {
  constructor(private context: ConfigurationBuildersContext) {}

  apply(bindingsRegistry: BindingsRegistry, container: ICascadingDefinitionResolver) {
    this.context.applyBindings(bindingsRegistry, container);
  }
}
