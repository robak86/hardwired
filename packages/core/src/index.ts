export { COWMap } from './context/InstancesMap.js';

export { BaseInterceptor, BaseRootInterceptor } from './container/interceptors/logging/BaseInterceptor.js';

export * from './container/interceptors/graph/DependenciesGraph.js';

export { LoggingInterceptor } from './container/interceptors/logging/LoggingInterceptor.js';

export { ScopeConfigurable, DisposableScopeConfigurable } from './configuration/abstract/ScopeConfigurable.js';
export { ContainerConfigurable } from './configuration/abstract/ContainerConfigurable.js';
export { IInterceptor } from './container/interceptors/interceptor.js';

export type { InstanceCreationAware, IContainerScopes } from './container/IContainer.js';
export { container, once, all } from './container/Container.js';

export * from './definitions/definitions.js';
export * from './definitions/abstract/sync/InstanceDefinition.js';
export * from './definitions/abstract/sync/InstanceDefinitionDependency.js';

export { value } from './definitions/sync/value.js';

export * from './definitions/sync/unbound.js';
export * from './definitions/abstract/LifeTime.js';

export * from './definitions/abstract/FnDefinition.js';
export { ExtensibleFunction } from './utils/ExtensibleFunction.js';

export * from './container/IContainer.js';
export * from './container/DisposableScope.js';

export { Middleware, withMiddleware, MiddlewareNextFn, createMiddleware } from './definitions/withMiddleware.js';
export { cls, ClassType } from './definitions/cls.js';
export { Definition, AnyDefinition } from './definitions/abstract/Definition.js';
export { ClassDefinition } from './definitions/abstract/ClassDefinition.js';

export * from './configuration/ContainerConfiguration.js';
export * from './configuration/ScopeConfiguration.js';
export * from './configuration/DisposableScopeConfiguration.js';
export * from './configuration/helper/compose.js';
export * from './utils/bindTestContainer.js';
