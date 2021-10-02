export { serviceLocator } from "./new/singletonStrategies";

export { container, Container } from './container/Container';


export * from './strategies/RequestStrategyLegacy';
export * from './strategies/SingletonStrategyLegacy';
export * from './strategies/TransientStrategyLegacy';
export * from './strategies/ScopeStrategyLegacy';

export type { Module, AnyResolver, ModuleRecord } from './module/Module';
export { inject } from './container/inject';
export type { DependencySelector } from './container/inject';
export { ContainerContext } from './context/ContainerContext';
export { ServiceLocator } from './container/ServiceLocator';

export { BuildStrategy } from './strategies/abstract/BuildStrategy';
export { ModulePatch } from './module/ModulePatch';
export type { IServiceLocator } from './container/IServiceLocator';
