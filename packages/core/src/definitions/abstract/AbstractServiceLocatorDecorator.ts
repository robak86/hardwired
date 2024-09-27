import { ExtensibleFunction } from '../../utils/ExtensibleFunction.js';
import { IServiceLocator } from '../../container/IContainer.js';

import { LifeTime } from './LifeTime.js';
import { ValidDependenciesLifeTime } from './sync/InstanceDefinitionDependency.js';
import { BaseDefinition } from './BaseDefinition.js';

export interface AbstractServiceLocatorDecorator<TAllowedLifeTime extends LifeTime> {
  <TValue, TArgs extends any[]>(
    instanceDefinition: BaseDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;
}

export abstract class AbstractServiceLocatorDecorator<TAllowedLifeTime extends LifeTime>
  extends ExtensibleFunction
  implements IServiceLocator<TAllowedLifeTime>
{
  readonly id: IServiceLocator<TAllowedLifeTime>['id'];
  readonly parentId: IServiceLocator<TAllowedLifeTime>['parentId'];
  readonly use: IServiceLocator<TAllowedLifeTime>['use'];
  readonly all: IServiceLocator<TAllowedLifeTime>['all'];
  readonly allAsync: IServiceLocator<TAllowedLifeTime>['allAsync'];
  readonly checkoutScope: IServiceLocator<TAllowedLifeTime>['checkoutScope'];
  readonly withScope: IServiceLocator<TAllowedLifeTime>['withScope'];

  constructor(private readonly containerContext: IServiceLocator<TAllowedLifeTime>) {
    super((definition: any) => {
      return this.containerContext(definition);
    });

    this.id = containerContext.id;
    this.parentId = containerContext.parentId;
    this.use = containerContext.use;
    this.all = containerContext.all;
    this.checkoutScope = containerContext.checkoutScope;
    this.withScope = containerContext.withScope;
    this.allAsync = containerContext.allAsync;
  }
}
