export { container, Container } from './container/Container';

export { ContainerContext } from './container/ContainerContext';

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

export { unit } from "./module/ModuleBuilder";
export { module } from "./module/ModuleBuilder";
export { Module } from "./resolvers/abstract/Module";
export type { PropTypesObject } from "./resolvers/abstract/Module";
export type { PropTypesTuple } from "./resolvers/abstract/Module";
export type { MaterializedRecord } from "./resolvers/abstract/Module";
export type { AnyResolver } from "./resolvers/abstract/Module";
export { Instance } from "./resolvers/abstract/Instance";
