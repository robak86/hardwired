import { ContainerCache } from '../container/container-cache';
import { createResolverId } from '../utils/fastId';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver } from './DependencyResolver';
import { ContainerEvents } from '../container/ContainerEvents';
import { ModuleBuilder } from '../builders/ModuleBuilder';

export abstract class AbstractDependencyResolver<TKey extends string, TReturn> {
  protected constructor(public key: TKey) {}

  public id: string = createResolverId();

  abstract build(registry: ModuleRegistry<any>, cache: ContainerCache, ctx): TReturn;
  onRegister?(events: ContainerEvents);
}

export abstract class AbstractRegistryDependencyResolver<TKey extends string, TReturn> {
  static isComposite(val: DependencyResolver<any, any>): val is AbstractRegistryDependencyResolver<any, any> {
    return val instanceof AbstractRegistryDependencyResolver;
  }

  // static isConstructorFor(param: DependencyResolver<any, any>): boolean {
  //   return param.constructor === this;
  // }

  protected constructor(public key: TKey, public registry: ModuleRegistry<any>) {}

  public id: string = createResolverId();

  abstract build(registry: ModuleRegistry<any>, cache: ContainerCache, ctx): TReturn;
  abstract forEach(iterFn: (resolver: DependencyResolver<any, any>) => any);
  onRegister?(events: ContainerEvents);
}
