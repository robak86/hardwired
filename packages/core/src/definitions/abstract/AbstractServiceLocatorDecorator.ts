import { ExtensibleFunction } from '../../utils/ExtensibleFunction.js';
import { IContainer, IServiceLocator } from '../../container/IContainer.js';
import { InstanceDefinition, InstancesArray } from './sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition.js';
import { BaseDefinition } from './FnDefinition.js';
import { AnyInstanceDefinition } from './AnyInstanceDefinition.js';
import { LifeTime } from './LifeTime.js';
import { ContainerScopeOptions } from '../../container/Container.js';

export interface AbstractServiceLocatorDecorator {
  <TValue>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;

  <TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;

  <TValue>(instanceDefinition: BaseDefinition<TValue, any, any>): TValue;

  <TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue;
}

export abstract class AbstractServiceLocatorDecorator extends ExtensibleFunction implements IServiceLocator {
  constructor(private readonly containerContext: IServiceLocator) {
    super((definition: any) => {
      return this.containerContext(definition);
    });
  }

  use<TValue>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  use<TValue>(instanceDefinition: BaseDefinition<TValue, any, any>): TValue;
  use<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue {
    return this.containerContext.use(instanceDefinition);
  }

  all<TDefinitions extends (InstanceDefinition<any, LifeTime, any> | BaseDefinition<any, LifeTime, any>)[]>(
    ...definitions: TDefinitions
  ): InstancesArray<TDefinitions> {
    return this.containerContext.all(...definitions) as any;
  }

  checkoutScope(options?: Omit<ContainerScopeOptions, 'globalOverrides'>): IContainer<LifeTime> {
    return this.containerContext.checkoutScope(options);
  }

  withScope<TValue>(fn: (locator: IServiceLocator<LifeTime>) => TValue): TValue {
    return this.containerContext.withScope(fn);
  }

  override(definition: AnyInstanceDefinition<any, any, any>): void {
    return this.containerContext.override(definition);
  }

  provide<T>(def: AnyInstanceDefinition<T, LifeTime.scoped, any>, instance: T): void {
    return this.containerContext.provide(def, instance);
  }
}
