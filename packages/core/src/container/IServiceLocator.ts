import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';

export interface IServiceLocator {
  get<TValue>(instanceDefinition: InstanceDefinition<TValue>): TValue;

  withRequestScope<T>(factory: (obj: IServiceLocator) => T): T;
}
