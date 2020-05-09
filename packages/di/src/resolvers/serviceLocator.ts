import { DependencyResolver } from './DependencyResolver';
import { Container, ModuleRegistry } from '..';
import { ContainerCache } from '../container/container-cache';

export type ServiceLocatorDependencyConfig = {};

export const serviceLocator = <TRegistry extends ModuleRegistry, TReturn>(
  run: (container: Container<TRegistry>) => TReturn,
  config: Partial<ServiceLocatorDependencyConfig> = {},
) => {
  return new ServiceLocatorResolver<TRegistry, TReturn>(run);
};

// TODO: it is stored as singleton
export class ServiceLocatorResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  constructor(private run: (container: Container<TRegistry>) => TReturn) {}

  build(container: Container<TRegistry>, ctx, cache: ContainerCache): TReturn {
    throw new Error('Implement me');
  }
}
