import { ContainerCache } from '../container/container-cache';
import { createResolverId } from '../utils/fastId';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver } from './DependencyResolver';
import { ContainerEvents } from '../container/ContainerEvents';
import { DependencyFactory } from '../draft';

export abstract class AbstractDependencyResolver<TKey extends string, TReturn> {
  // public type: 'dependency' = 'dependency';
  protected constructor(public key: TKey) {}

  public id: string = createResolverId();

  // TODO: splitting build into two steps solves problem of providing registry by the container. AbstractDependencyResolver may cache
  abstract build(registry: ModuleRegistry<any>): DependencyFactory<TReturn>;
  onRegister?(events: ContainerEvents);
}

export abstract class AbstractRegistryDependencyResolver<TKey extends string, TReturn> {
  // public type: 'registry' = 'registry';

  static isComposite(val: DependencyResolver<any, any>): val is AbstractRegistryDependencyResolver<any, any> {
    return val instanceof AbstractRegistryDependencyResolver;
  }

  // static isConstructorFor(param: DependencyResolver<any, any>): boolean {
  //   return param.constructor === this;
  // }

  protected constructor(public key: TKey, public registry: ModuleRegistry<any>) {}

  public id: string = createResolverId();

  abstract build(registry: ModuleRegistry<any>): TReturn;
  abstract forEach(iterFn: (resolver: DependencyResolver<any, any>) => any);
  onRegister?(events: ContainerEvents);
}
