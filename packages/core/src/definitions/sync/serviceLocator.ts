import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { IServiceLocator } from '../../container/IServiceLocator';
import { ServiceLocatorStrategy } from '../../strategies/ServiceLocatorStrategy';
import { v4 } from 'uuid';

export const serviceLocator: InstanceDefinition<IServiceLocator> = {
  id: v4(),
  strategy: ServiceLocatorStrategy.type,
  isAsync: false,
  create: build => {
    throw new Error('Service locator instance is created by ServiceLocatorStrategy');
  },
};
