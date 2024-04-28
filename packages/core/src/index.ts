export type { IContainer, InstanceCreationAware, IContainerScopes } from './container/IContainer.js';
export { container, Container } from './container/Container.js';

export * from './strategies/SingletonStrategy.js';
export * from './strategies/TransientStrategy.js';
export * from './definitions/definitions.js';
export * from './definitions/abstract/sync/InstanceDefinition.js';
export * from './definitions/abstract/sync/InstanceDefinitionDependency.js';

export * from './patching/replace.js';
export * from './patching/apply.js';
export * from './patching/set.js';
export * from './patching/decorate.js';

export { ContainerContext } from './context/ContainerContext.js';

export { BuildStrategy } from './strategies/abstract/BuildStrategy.js';

export * from './definitions/sync/object.js';
export * from './definitions/sync/tuple.js';

export { value } from './definitions/sync/value.js';

export * from './definitions/sync/implicit.js';
export * from './definitions/sync/intersection.js';
export * from './definitions/abstract/LifeTime.js';
export type { DerivedLifeTime } from './definitions/utils/DerivedLifeTime.js';
export * from './utils/ClassType.js';
export type { InstancesBuilder } from './context/abstract/InstancesBuilder.js';
export * from './builder/buildDefine.js';
