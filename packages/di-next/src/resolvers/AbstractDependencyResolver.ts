import { createResolverId } from "../utils/fastId";
import { ModuleRegistry } from "../module/ModuleRegistry";
import { DependencyResolver } from "./DependencyResolver";
import { ContainerEvents } from "../container/ContainerEvents";
import { DependencyFactory } from "../draft";
import { RegistryRecord } from "../module/RegistryRecord";
import { ModuleBuilder } from "../builders/ModuleBuilder";

export abstract class AbstractDependencyResolver<TReturn> {
  // public type: 'dependency' = 'dependency';
  protected constructor() {}

  public id: string = createResolverId();

  // TODO: splitting build into two steps solves problem of providing registry by the container. AbstractDependencyResolver may cache
  abstract build(registry: ModuleRegistry<any>): DependencyFactory<TReturn>;
  onRegister?(events: ContainerEvents);
}

export abstract class AbstractRegistryDependencyResolver<TReturn extends RegistryRecord> {
  // public type: 'registry' = 'registry';

  static isComposite(val: DependencyResolver<any>): val is AbstractRegistryDependencyResolver<any> {
    return val instanceof AbstractRegistryDependencyResolver;
  }

  // static isConstructorFor(param: DependencyResolver<any, any>): boolean {
  //   return param.constructor === this;
  // }

  protected constructor(public registry: ModuleBuilder<any>) {}

  public id: string = createResolverId();

  abstract build(): ModuleRegistry<TReturn>;
  abstract forEach(iterFn: (resolver: DependencyResolver<any>) => any);
  onRegister?(events: ContainerEvents);
}
