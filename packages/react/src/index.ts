// components
export { ContainerProvider } from './components/ContainerProvider';
export type { ContainerProviderProps } from './components/ContainerProvider';

export { ContainerScope } from './components/ContainerScope';
export { InstancesConsumer } from './components/InstancesConsumer';
export type { ModulesConsumerProps } from './components/InstancesConsumer';

// hooks
export { useDefinition } from './hooks/useDefinition';
export { useDefinitions } from './hooks/useDefinitions';
export { useScopedDefinition } from './hooks/useScopedDefinition';
export { useSelectScoped } from './hooks/useSelectScoped';

// HOC
export { withDependencies } from './hoc/withDependencies';
export type { WithDependenciesConfigured } from './hoc/withDependencies';
export { withScope } from './hoc/withScope';
export type { WithScopeConfig } from './hoc/withScope';
