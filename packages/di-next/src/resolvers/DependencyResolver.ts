import { AbstractDependencyResolver, AbstractModuleResolver } from './AbstractDependencyResolver';

// prettier-ignore
export type DependencyResolver<TValue> =
  | AbstractDependencyResolver<any>
  | AbstractModuleResolver<any>;
