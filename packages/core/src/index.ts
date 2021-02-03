export { container, Container } from './container/Container';
export { unit, module, ModuleBuilder } from './module/ModuleBuilder';
export { ContainerContext } from './container/ContainerContext';

export * from './strategies/RequestStrategy';
export * from './strategies/SingletonStrategy';
export * from './strategies/TransientStrategy';

export { Instance } from './resolvers/abstract/Instance';
export type { Module, AnyResolver, ModuleRecord } from './resolvers/abstract/Module';

export { Scope } from './resolvers/abstract/Instance';
