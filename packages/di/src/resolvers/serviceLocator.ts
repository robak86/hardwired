import { DependencyResolver } from './DependencyResolver';
import { Container, ModuleRegistry } from '..';
import { ContainerCache } from '../container/container-cache';

export type ServiceLocatorDependencyConfig = {};

export const serviceLocator = <TRegistry extends ModuleRegistry, TContext, TReturn>(
  run: (container: Container<TRegistry, TContext>) => TReturn,
  config: Partial<ServiceLocatorDependencyConfig> = {},
) => {
  return new ServiceLocatorResolver<TRegistry, TContext, TReturn>(run);
};

// TODO: it is stored as singleton
export class ServiceLocatorResolver<TRegistry extends ModuleRegistry, TContext, TReturn>
  implements DependencyResolver<TRegistry, TContext, TReturn> {
  constructor(private run: (container: Container<TRegistry, TContext>) => TReturn) {}

  build(container: TRegistry, ctx, cache: ContainerCache): TReturn {
    throw new Error('Implement me');
  }
}
