export { unit, module } from './module/Module';
export { container, Container } from './container/Container';

export { ModuleLookup } from './module/ModuleLookup';
export { ContainerContext } from './container/ContainerContext';
export type { RegistryRecord } from './module/RegistryRecord';
export type { DependencyResolver } from './resolvers/DependencyResolver';
export { AbstractDependencyResolver } from './resolvers/abstract/AbstractDependencyResolver';

export { singleton, ClassSingletonResolver } from './resolvers/ClassSingletonResolver';

export * from './module/ModuleBuilder';

export { factory, FactoryResolver } from './resolvers/FactoryResolver';
export type { Factory } from './resolvers/FactoryResolver';

export { transient, ClassTransientResolver } from './resolvers/ClassTransientResolver';
export { value, ValueResolver } from './resolvers/ValueResolver';
export { func, FunctionResolver } from './resolvers/FunctionResolver';
export { request, ClassRequestResolver } from './resolvers/ClassRequestResolver';
export { serviceLocator, ServiceLocatorResolver } from './resolvers/ServiceLocatorResolver';
export { ServiceLocator } from './container/ServiceLocator';


export type { ClassType } from './utils/ClassType';
export { EventsEmitter } from './utils/EventsEmitter';
export { InstanceLegacy } from './resolvers/abstract/InstanceLegacy';

export * from './resolvers/abstract/AbstractResolvers';
