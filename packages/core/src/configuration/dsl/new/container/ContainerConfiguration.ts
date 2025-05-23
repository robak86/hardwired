import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { ICascadingDefinitionResolver } from '../../../../container/IContainer.js';
import type { ConfigurationBuildersContext } from '../shared/context/ConfigurationBuildersContext.js';
import type { InterceptorsRegistry } from '../../../../container/interceptors/InterceptorsRegistry.js';
import type { ILifeCycleRegistry } from '../../../../lifecycle/ILifeCycleRegistry.js';

export interface IContainerConfiguration {
  // TODO: it shouldn't apply anything. It should return objects that can be linked
  //  to the corresponding structures from the parent scope
  //  By linking we trade time required for scope initialization for a little bit slower resolution
  apply(
    bindingsRegistry: BindingsRegistry,
    container: ICascadingDefinitionResolver,
    interceptorsRegistry: InterceptorsRegistry,
    lifecycleRegistry: ILifeCycleRegistry,
  ): void;
}

export class ContainerConfiguration implements IContainerConfiguration {
  constructor(private context: ConfigurationBuildersContext) {}

  apply(
    bindingsRegistry: BindingsRegistry,
    container: ICascadingDefinitionResolver,
    interceptorsRegistry: InterceptorsRegistry,
    lifecycleRegistry: ILifeCycleRegistry,
  ) {
    this.context.applyBindings(bindingsRegistry, container, interceptorsRegistry, lifecycleRegistry);
  }
}

export class ScopeConfiguration implements IContainerConfiguration {
  constructor(private context: ConfigurationBuildersContext) {}

  apply(
    bindingsRegistry: BindingsRegistry,
    container: ICascadingDefinitionResolver,
    interceptorsRegistry: InterceptorsRegistry,
    lifecycleRegistry: ILifeCycleRegistry,
  ) {
    this.context.applyBindings(bindingsRegistry, container, interceptorsRegistry, lifecycleRegistry);
  }
}
