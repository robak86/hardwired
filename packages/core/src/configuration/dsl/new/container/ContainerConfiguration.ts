import type { ILifeCycleRegistry } from '../../../../lifecycle/ILifeCycleRegistry.js';
import type { ScopeRegistry } from '../../../../context/ScopeRegistry.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IInterceptor, InterceptorClass } from '../../../../container/interceptors/interceptor.js';
import type { DefinitionsTransformsRegistry } from '../../../../context/DefinitionsTransformsRegistry.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';

export interface IDefinitionsRegistryConfiguration {
  readonly definitions: ScopeRegistry<IDefinition<unknown, LifeTime>>;
  readonly frozenDefinitions: ScopeRegistry<IDefinition<unknown, LifeTime>>;
  readonly definitionsTransforms: DefinitionsTransformsRegistry;
}

export interface ICascadingDefinitionsConfiguration {
  readonly cascadingTokens: Set<IDefinitionToken<any, LifeTime.cascading>>;
  readonly inheritedTokens: Set<IDefinitionToken<unknown, LifeTime.cascading>>;
}

export interface ILifecycleConfiguration {
  readonly lifeCycleRegistry: ILifeCycleRegistry;
}

export interface IInterceptorsConfiguration {
  readonly interceptors?: Set<InterceptorClass<IInterceptor>>;
}

export interface IContainerConfiguration
  extends ICascadingDefinitionsConfiguration,
    IDefinitionsRegistryConfiguration,
    ILifecycleConfiguration,
    IInterceptorsConfiguration {}

export class ContainerConfiguration implements IContainerConfiguration {
  constructor(
    public readonly definitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
    public readonly frozenDefinitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
    public readonly definitionsTransforms: DefinitionsTransformsRegistry,
    public readonly cascadingTokens: Set<IDefinitionToken<any, LifeTime.cascading>>,
    public readonly inheritedTokens: Set<IDefinitionToken<any, LifeTime.cascading>>,
    public readonly lifeCycleRegistry: ILifeCycleRegistry,
    public readonly interceptors?: Set<InterceptorClass<IInterceptor>>,
  ) {}
}
