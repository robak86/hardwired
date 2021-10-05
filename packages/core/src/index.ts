export { serviceLocator } from './strategies/factory/strategies';

export { container, Container } from './container/Container';

export * from './strategies/RequestStrategy';
export * from './strategies/SingletonStrategy';
export * from './strategies/TransientStrategy';
export * from './strategies/ScopeStrategy';
export * from './strategies/factory/strategies';
export * from './strategies/abstract/InstanceDefinition';

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

export { buildAsyncClassDefinition } from './strategies/abstract/AsyncInstanceDefinition';
