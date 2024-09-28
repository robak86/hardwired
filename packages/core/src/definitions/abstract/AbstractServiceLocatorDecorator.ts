import { ExtensibleFunction } from '../../utils/ExtensibleFunction.js';
import { IContainer } from '../../container/IContainer.js';

import { LifeTime } from './LifeTime.js';
import { ValidDependenciesLifeTime } from './sync/InstanceDefinitionDependency.js';
import { Definition } from './Definition.js';

export interface AbstractServiceLocatorDecorator<TAllowedLifeTime extends LifeTime> {
  <TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;
}

export abstract class AbstractServiceLocatorDecorator<TAllowedLifeTime extends LifeTime>
  extends ExtensibleFunction
  implements IContainer<TAllowedLifeTime>
{
  readonly id: IContainer<TAllowedLifeTime>['id'];
  readonly parentId: IContainer<TAllowedLifeTime>['parentId'];
  readonly use: IContainer<TAllowedLifeTime>['use'];
  readonly all: IContainer<TAllowedLifeTime>['all'];
  readonly defer: IContainer<TAllowedLifeTime>['defer'];
  readonly checkoutScope: IContainer<TAllowedLifeTime>['checkoutScope'];
  readonly withScope: IContainer<TAllowedLifeTime>['withScope'];

  constructor(private readonly containerContext: IContainer<TAllowedLifeTime>) {
    super((definition: any) => {
      return this.containerContext(definition);
    });

    // TODO: maybe Object.assign is better here?
    this.id = containerContext.id;
    this.parentId = containerContext.parentId;
    this.use = containerContext.use;
    this.all = containerContext.all;
    this.checkoutScope = containerContext.checkoutScope;
    this.withScope = containerContext.withScope;
    this.defer = containerContext.defer;
  }
}
