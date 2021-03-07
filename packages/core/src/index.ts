export { container, Container } from './container/Container';
export { unit, module, ModuleBuilder } from './module/ModuleBuilder';

export * from './strategies/RequestStrategy';
export * from './strategies/SingletonStrategy';
export * from './strategies/TransientStrategy';
export * from './strategies/ScopeStrategy';

export { Instance } from './resolvers/abstract/Instance';
export type { Module, AnyResolver, ModuleRecord } from './resolvers/abstract/Module';
export { buildTaggedStrategy } from './strategies/utils/strategyTagging';
export { inject } from './container/inject';
