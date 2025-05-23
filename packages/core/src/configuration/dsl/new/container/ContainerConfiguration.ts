import type { InterceptorsRegistry } from '../../../../container/interceptors/InterceptorsRegistry.js';
import type { ILifeCycleRegistry } from '../../../../lifecycle/ILifeCycleRegistry.js';
import type { IReadonlyScopeRegistry } from '../../../../context/ScopeRegistry.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ILazyDefinitionBuilder } from '../utils/abstract/ILazyDefinitionBuilder.js';
import type { IDefinitionToken } from '../../../../definitions/def-symbol.js';
import type { INewInterceptor } from '../../../../container/interceptors/interceptor.js';
import type { ClassType } from '../../../../definitions/utils/class-type.js';

export interface IBindingsRegistryConfiguration {
  readonly definitions: IReadonlyScopeRegistry<IDefinition<unknown, LifeTime>, LifeTime>;
  readonly frozenDefinitions: IReadonlyScopeRegistry<IDefinition<unknown, LifeTime>, LifeTime>;
  readonly lazyDefinitions: ReadonlyArray<ILazyDefinitionBuilder<unknown, LifeTime>>;
  readonly frozenLazyDefinitions: ReadonlyArray<ILazyDefinitionBuilder<unknown, LifeTime>>;
  readonly cascadingTokens: Set<IDefinitionToken<any, LifeTime.cascading>>;
}

export interface ILifecycleConfiguration {
  readonly lifeCycleRegistry: ILifeCycleRegistry;
}

export interface IInterceptorsConfiguration {
  readonly interceptors: InterceptorsRegistry;
  readonly interceptorsNew?: Set<ClassType<INewInterceptor, []>>;
}

export interface IConfiguration
  extends IBindingsRegistryConfiguration,
    ILifecycleConfiguration,
    IInterceptorsConfiguration {}

export class ContainerConfiguration implements IConfiguration {
  constructor(
    public readonly definitions: IReadonlyScopeRegistry<IDefinition<unknown, LifeTime>, LifeTime>,
    public readonly frozenDefinitions: IReadonlyScopeRegistry<IDefinition<unknown, LifeTime>, LifeTime>,
    public readonly lazyDefinitions: ReadonlyArray<ILazyDefinitionBuilder<unknown, LifeTime>>,
    public readonly frozenLazyDefinitions: ReadonlyArray<ILazyDefinitionBuilder<unknown, LifeTime>>,
    public readonly cascadingTokens: Set<IDefinitionToken<any, LifeTime.cascading>>,
    public readonly lifeCycleRegistry: ILifeCycleRegistry,
    public readonly interceptors: InterceptorsRegistry,
    public readonly interceptorsNew?: Set<ClassType<INewInterceptor, []>>,
  ) {}
}
