import { createResolverId } from '../utils/fastId';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver } from './DependencyResolver';
import { ContainerEvents } from '../container/ContainerEvents';
import { DependencyFactory } from '../draft';
import { RegistryRecord } from '../module/RegistryRecord';
import { ModuleBuilder } from '../builders/ModuleBuilder';

export abstract class AbstractDependencyResolver<TReturn> {
  public id: string = createResolverId();
  public readonly type: 'dependency' = 'dependency';

  protected constructor() {}

  // TODO: splitting build into two steps solves problem of providing registry by the container. AbstractDependencyResolver may cache
  abstract build(registry: ModuleRegistry<any>): DependencyFactory<TReturn>;
  onRegister?(events: ContainerEvents);
}

export abstract class AbstractModuleResolver<TReturn extends RegistryRecord> {
  public readonly type: 'module' = 'module';

  static isModuleResolver(val: DependencyResolver<any>): val is AbstractModuleResolver<any> {
    return val instanceof AbstractModuleResolver;
  }

  // static isConstructorFor(param: DependencyResolver<any, any>): boolean {
  //   return param.constructor === this;
  // }

  protected constructor(public registry: ModuleBuilder<any>) {}

  public id: string = createResolverId();

  abstract build(injections?): TReturn;

  onRegister?(events: ContainerEvents);
}
