import type { ILifeCycleRegistry } from '../../../../lifecycle/ILifeCycleRegistry.js';
import type { ScopeRegistry } from '../../../../context/ScopeRegistry.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IInterceptor, InterceptorClass } from '../../../../container/interceptors/interceptor.js';
import type { LazyDefinitionsRegistry } from '../../../../context/LazyDefinitionsRegistry.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';

export interface IBindingsRegistryConfiguration {
  readonly definitions: ScopeRegistry<IDefinition<unknown, LifeTime>>;
  readonly frozenDefinitions: ScopeRegistry<IDefinition<unknown, LifeTime>>;
  readonly lazyDefinitions: LazyDefinitionsRegistry;
  readonly cascadingTokens: Set<IDefinitionToken<any, LifeTime.cascading>>;
}

export interface ILifecycleConfiguration {
  readonly lifeCycleRegistry: ILifeCycleRegistry;
}

export interface IInterceptorsConfiguration {
  readonly interceptors?: Set<InterceptorClass<IInterceptor>>;
}

export interface IContainerConfiguration
  extends IBindingsRegistryConfiguration,
    ILifecycleConfiguration,
    IInterceptorsConfiguration {}

export class ContainerConfiguration implements IContainerConfiguration {
  constructor(
    public readonly definitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
    public readonly frozenDefinitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
    public readonly lazyDefinitions: LazyDefinitionsRegistry,
    public readonly cascadingTokens: Set<IDefinitionToken<any, LifeTime.cascading>>,
    public readonly lifeCycleRegistry: ILifeCycleRegistry,
    public readonly interceptors?: Set<InterceptorClass<IInterceptor>>,
  ) {}
}
