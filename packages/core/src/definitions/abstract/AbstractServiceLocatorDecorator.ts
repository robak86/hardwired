import { ExtensibleFunction } from '../../utils/ExtensibleFunction.js';
import { IServiceLocator } from '../../container/IContainer.js';
import { InstanceDefinition } from './sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition.js';
import { BaseDefinition } from './FnDefinition.js';
import { AnyInstanceDefinition } from './AnyInstanceDefinition.js';

export interface AbstractServiceLocatorDecorator {
  <TValue>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;

  <TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;

  <TValue>(instanceDefinition: BaseDefinition<TValue, any, any>): TValue;

  <TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue;
}

export abstract class AbstractServiceLocatorDecorator extends ExtensibleFunction implements IServiceLocator {
  readonly use: IServiceLocator['use'];
  readonly all: IServiceLocator['all'];
  readonly checkoutScope: IServiceLocator['checkoutScope'];
  readonly withScope: IServiceLocator['withScope'];
  readonly override: IServiceLocator['override'];
  readonly provide: IServiceLocator['provide'];

  protected constructor(private readonly containerContext: IServiceLocator) {
    super((definition: any) => {
      return this.containerContext(definition);
    });

    this.use = containerContext.use;
    this.all = containerContext.all;
    this.checkoutScope = containerContext.checkoutScope;
    this.withScope = containerContext.withScope;
    this.override = containerContext.override;
    this.provide = containerContext.provide;
  }
}
