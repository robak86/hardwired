export type { IContainer, InstanceCreationAware, IContainerScopes } from './container/IContainer.js';
export { container, Container } from './container/Container.js';

export * from './strategies/SingletonStrategy.js';
export * from './strategies/TransientStrategy.js';
export * from './definitions/definitions.js';
export * from './definitions/abstract/sync/InstanceDefinition.js';
export * from './definitions/abstract/sync/InstanceDefinitionDependency.js';

export { ContainerContext } from './context/ContainerContext.js';

export { BuildStrategy } from './strategies/abstract/BuildStrategy.js';

export { value } from './definitions/sync/value.js';

export * from './definitions/sync/implicit.js';
export * from './definitions/abstract/LifeTime.js';
export type { DerivedLifeTime } from './definitions/utils/DerivedLifeTime.js';

export type { InstancesBuilder } from './context/abstract/InstancesBuilder.js';
export { ContainerInterceptor } from './context/ContainerInterceptor.js';

export * from './definitions/abstract/FnDefinition.js';
export { ExtensibleFunction } from './utils/ExtensibleFunction.js';
export * from './definitions/abstract/AbstractServiceLocatorDecorator.js';

export * from './container/Patch.js';
export * from './container/IContainer.js';
export * from './container/Patch.js';

export { Middleware, combine, CreateFn } from './definitions/combine.js';
