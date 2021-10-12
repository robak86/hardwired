import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/AsyncInstanceDefinition';
import { ChildScopeOptions } from "./Container";

export interface IServiceLocator {
  get<TValue>(instanceDefinition: InstanceDefinition<TValue>): TValue;
  getAsync<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any>): Promise<TValue>;
  checkoutScope(options?: ChildScopeOptions): IServiceLocator
  getAll<TLazyModule extends Array<InstanceDefinition<any>>>(
      ...definitions: TLazyModule
  ): { [K in keyof TLazyModule]: TLazyModule[K] extends InstanceDefinition<infer TInstance> ? TInstance : unknown }
  withRequestScope<T>(factory: (obj: IServiceLocator) => T): T
}
