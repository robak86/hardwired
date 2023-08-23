import { ContainerInterceptor } from '../context/ContainerContext.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';

export class SerializationInterceptor implements ContainerInterceptor {
  constructor(private restoreFrom?: Record<string, any>) {}

  interceptSync?<T>(instance: T, definition: InstanceDefinition<T, any>, context: InstancesBuilder): T {
    throw new Error('Implement me!');

    // if (definition)
  }

  interceptAsync?<T>(instance: T, definition: AsyncInstanceDefinition<T, any>, context: InstancesBuilder): Promise<T> {
    throw new Error('Implement me!');
  }

  dump(): string {
    throw new Error('Implement me!');
  }
}
