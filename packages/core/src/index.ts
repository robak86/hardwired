export { container, Container } from './container/Container';
export { unit, module, ModuleBuilder } from './module/ModuleBuilder';
export { ContainerContext } from './container/ContainerContext';

export { singleton, ClassSingletonResolver } from './resolvers/ClassSingletonResolver';
export { transient, ClassTransientResolver } from './resolvers/ClassTransientResolver';
export { value, ValueResolver } from './resolvers/ValueResolver';
export { func, FunctionResolver } from './resolvers/FunctionResolver';
export { request, ClassRequestResolver } from './resolvers/ClassRequestResolver';
export { serviceLocator, ServiceLocatorResolver } from './resolvers/ServiceLocatorResolver';
export { ServiceLocator } from './container/ServiceLocator';
export { factory, FactoryResolver } from './resolvers/FactoryResolver';
export type { Factory } from './resolvers/FactoryResolver';

export type { ClassType } from './utils/ClassType';

export { Instance } from './resolvers/abstract/Instance';
export type { Module, PropTypesTuple, AnyResolver, ModuleRecord } from './resolvers/abstract/Module';

export type { LiteralResolverDefinition } from './resolvers/LiteralResolver';
export { LiteralResolver, literal } from './resolvers/LiteralResolver';
export { Scope } from './resolvers/abstract/Instance';
