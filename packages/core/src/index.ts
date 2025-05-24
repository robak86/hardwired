export type { MaybePromise } from './utils/async.js';

export { AbstractGraphDependenciesInterceptor } from './container/interceptors/graph/AbstractGraphDependenciesInterceptor.js';

export { COWMap } from './context/COWMap.js';

export * from './container/interceptors/graph/DependenciesGraph.js';

export type { IScopeConfigurable } from './configuration/abstract/IScopeConfigurable.js';
export type { IContainerConfigurable } from './configuration/abstract/IContainerConfigurable.js';

export type { InstanceCreationAware, IContainerScopes } from './container/IContainer.js';
export { Container, container } from './container/Container.js';

export * from './definitions/def-symbol.js';

export type * from './definitions/abstract/InstanceDefinition.js';
export type * from './definitions/abstract/InstanceDefinitionDependency.js';

export { value } from './definitions/value.js';

export * from './definitions/utils/derivedLifeTime.js';

export * from './definitions/abstract/LifeTime.js';

export { ExtensibleFunction } from './utils/ExtensibleFunction.js';

export type * from './container/IContainer.js';

export type { ClassType } from './definitions/utils/class-type.js';

export { Definition } from './definitions/impl/Definition.js';
export { ClassDefinition } from './definitions/impl/ClassDefinition.js';

export * from './configuration/ContainerConfiguration.js';
export * from './configuration/ScopeConfiguration.js';

export type { AnyDefinitionSymbol, IDefinition } from './definitions/abstract/IDefinition.js';
