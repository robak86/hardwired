// components
export { ContainerProvider } from './components/ContainerProvider.js';
export type { ContainerProviderProps } from './components/ContainerProvider.js';

export { ContainerScope } from './components/ContainerScope.js';
export type { ContainerScopeProps } from './components/ContainerScope.js';

export { DefinitionsConsumer } from './components/DefinitionsConsumer.js';
export type { DefinitionsConsumerProps } from './components/DefinitionsConsumer.js';

// hooks
export { useDefinition } from './hooks/useDefinition.js';
export { useDefinitions } from './hooks/useDefinitions.js';
export { useContainer } from './context/ContainerContext.js';

// HOC
export { withDependencies } from './hoc/withDependencies.js';
export type { WithDependenciesConfigured } from './hoc/withDependencies.js';
export * from './hoc/inject.js';
