export { serviceLocator } from './definitions/factory/definitions';

export { container, Container } from './container/Container';

export * from './strategies/sync/RequestStrategy';
export * from './strategies/sync/SingletonStrategy';
export * from './strategies/sync/TransientStrategy';
export * from './strategies/sync/ScopeStrategy';
export * from './definitions/factory/definitions';
export * from './definitions/InstanceDefinition';

export * from './patching/replace';
export * from './patching/apply';
export * from './patching/set';
export * from './patching/decorate';

export { inject } from './helpers/inject';
export type { DependencySelector } from './helpers/inject';
export { ContainerContext } from './context/ContainerContext';
export { ServiceLocator } from './container/ServiceLocator';

export { BuildStrategy } from './strategies/abstract/BuildStrategy';
export type { IServiceLocator } from './container/IServiceLocator';

export { buildAsyncClassDefinition } from './definitions/AsyncInstanceDefinition';
export * from './definitions/factory/customDefinitions';
export * from './definitions/factory/object'
