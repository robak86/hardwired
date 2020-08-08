import { AbstractDependencyResolver, AbstractRegistryDependencyResolver } from './AbstractDependencyResolver';

// prettier-ignore
export type DependencyResolver<TValue> =
  | AbstractDependencyResolver<any>
  | AbstractRegistryDependencyResolver<any>;
