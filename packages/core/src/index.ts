export { container, Container } from './container/Container';

export * from './strategies/sync/RequestStrategy';
export * from './strategies/sync/SingletonStrategy';
export * from './strategies/sync/TransientStrategy';
export * from './strategies/sync/ScopeStrategy';
export * from './definitions/definitions';
export * from './definitions/abstract/InstanceDefinition';

export * from './patching/replace';
export * from './patching/apply';
export * from './patching/set';
export * from './patching/decorate';

export { ContainerContext } from './context/ContainerContext';
export { ServiceLocator } from './container/ServiceLocator';

export { BuildStrategy } from './strategies/abstract/BuildStrategy';
export type { IServiceLocator } from './container/IServiceLocator';

export * from './definitions/sync/object';
export * from './definitions/sync/tuple';
export { serviceLocator } from './definitions/sync/serviceLocator';
export { value } from './definitions/sync/value';
export * from './definitions/sync/factory';
