export { container, Container } from './container/Container';

export * from './strategies/sync/RequestStrategy';
export * from './strategies/sync/SingletonStrategy';
export * from './strategies/sync/TransientStrategy';
export * from './definitions/definitions';
export * from './definitions/abstract/InstanceDefinition';

export * from './patching/replace';
export * from './patching/apply';
export * from './patching/set';
export * from './patching/decorate';

export { ContainerContext } from './context/ContainerContext';

export { BuildStrategy } from './strategies/abstract/BuildStrategy';

export * from './definitions/sync/object';
export * from './definitions/sync/tuple';

export { value } from './definitions/sync/value';

export * from './definitions/sync/factory';
export * from './definitions/async/asyncFactory';
export * from './definitions/sync/external';
export * from './definitions/sync/intersection';
export * from './definitions/abstract/LifeTime';
export type { DerivedLifeTime } from "./definitions/abstract/DerivedLifeTime";
export { Resolution } from "./definitions/abstract/Resolution";
