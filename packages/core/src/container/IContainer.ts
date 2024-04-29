import { InstanceDefinition, InstancesArray } from '../definitions/abstract/InstanceDefinition.js';

import { ContainerScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import {
  InstanceDefinitionDependency,
  ValidDependenciesLifeTime,
} from '../definitions/abstract/InstanceDefinitionDependency.js';

import { Omit } from 'utility-types';
import { ClassType } from '../utils/ClassType.js';

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue>(instanceDefinition: InstanceDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, any>): TValue;
  use<TValue>(
    instanceDefinition: InstanceDefinition<Promise<TValue>, ValidDependenciesLifeTime<TAllowedLifeTime>, any>,
  ): Promise<TValue>;
  use<TValue>(
    instanceDefinition: InstanceDefinition<Promise<TValue> | TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, any>,
  ): Promise<TValue> | TValue;

  build<
    TInstance,
    TArgs extends any[],
    TDependencies extends {
      [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], ValidDependenciesLifeTime<TAllowedLifeTime>>;
    },
  >(
    klass: ClassType<TInstance, TArgs>,
    ...dependencies: TDependencies
  ): TInstance;

  useAll<TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any>[]>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  checkoutScope(options?: Omit<ContainerScopeOptions, 'globalOverrides'>): IContainer<TAllowedLifeTime>;
  withScope<TValue>(fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;
  override(definition: InstanceDefinition<any, any, any>): void;
  provide<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: T): void;
}

export interface IServiceLocator<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends IServiceLocator<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;
}
