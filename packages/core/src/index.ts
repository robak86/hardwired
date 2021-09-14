export { container, Container } from './container/Container';
export { unit, module, ModuleBuilder } from './module/ModuleBuilder';

export * from './strategies/RequestStrategy';
export * from './strategies/SingletonStrategy';
export * from './strategies/TransientStrategy';
export * from './strategies/ScopeStrategy';

export type { Module, AnyResolver, ModuleRecord } from './module/Module';
export { inject } from './container/inject';
export type { DependencySelector } from './container/inject';
export { ContainerContext } from './context/ContainerContext';
export { ServiceLocator } from './container/ServiceLocator';
export { serviceLocator } from './strategies/ServiceLocatorStrategy';
export { BuildStrategy } from './strategies/abstract/BuildStrategy';
export { ModulePatch } from './module/ModulePatch';
export type { IServiceLocator } from './container/IServiceLocator';
