// components
export { ContainerProvider } from './components/ContainerProvider';
export type { ContainerProviderProps } from './components/ContainerProvider';

export { ContainerScope } from './components/ContainerScope';
export { ModulesConsumer } from './components/ModulesConsumer';
export type { ModulesConsumerProps } from './components/ModulesConsumer';

// hooks
export { useDefinition } from './hooks/useDefinition';
export { useModule } from './hooks/useModule';
export { useModules } from './hooks/useModules';
export { useScopedDefinition } from './hooks/useScopedDefinition';
export { useSelectScoped } from './hooks/useSelectScoped';

// HOC
export { withDependencies } from './hoc/withDependencies';
export type { WithDependenciesConfigured } from './hoc/withDependencies';
export { withScope } from './hoc/withScope';
export type { WithScopeConfig } from './hoc/withScope';
