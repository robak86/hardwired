export { container, Container } from './container/Container';
export { unit, module, ModuleBuilder } from './module/ModuleBuilder';

export * from './strategies/RequestStrategy';
export * from './strategies/SingletonStrategy';
export * from './strategies/TransientStrategy';
export * from './strategies/ScopeStrategy';

export { BuildStrategy } from './resolvers/abstract/BuildStrategy';
export type { Module, AnyResolver, ModuleRecord } from './module/Module';
export { buildTaggedStrategy } from './strategies/utils/strategyTagging';
export { inject } from './container/inject';
export { ContainerContext } from './context/ContainerContext';
export { ServiceLocator } from './container/ServiceLocator';
export { serviceLocator } from './resolvers/ServiceLocatorResolver';
