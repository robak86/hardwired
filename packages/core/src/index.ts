export { serviceLocator } from './new/singletonStrategies';

export { container, Container } from './container/Container';

export * from './strategies/RequestStrategy';
export * from './strategies/SingletonStrategy';
export * from './strategies/TransientStrategy';
export * from './strategies/ScopeStrategy';

export { inject } from './container/inject';
export type { DependencySelector } from './container/inject';
export { ContainerContext } from './context/ContainerContext';
export { ServiceLocator } from './container/ServiceLocator';

export { BuildStrategyNew } from './strategies/abstract/_BuildStrategy';
export type { IServiceLocator } from './container/IServiceLocator';
