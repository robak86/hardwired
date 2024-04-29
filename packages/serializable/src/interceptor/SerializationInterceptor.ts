import { AsyncInstanceDefinition, ContainerContext, ContainerInterceptor, InstanceDefinition } from 'hardwired';
import { isSerializable } from '../abstract/Serializable.js';

export class SerializationInterceptor implements ContainerInterceptor {
  private serializableInstances: Record<string, any> = {};

  constructor(private restoreFrom?: Record<string, any>) {}

  interceptSync?<T>(definition: InstanceDefinition<T, any, any>, context: ContainerContext): T {
    if (definition.meta.serializable) {
      const instance = definition.create(context);
      if (Object.prototype.hasOwnProperty.call(this.serializableInstances, definition.id)) {
        throw new Error(
          `Serializable instance ${definition.id} already marked for serialization. There is a probably an id collision.`,
        );
      }

      this.serializableInstances[definition.id] = instance;

      if (this.restoreFrom && Object.prototype.hasOwnProperty.call(this.restoreFrom, definition.id)) {
        if (isSerializable(instance)) {
          instance.restore(this.restoreFrom[definition.id]);
        } else {
          throw new Error(`Trying to restore non-serializable instance ${definition.id}`);
        }
      }

      return instance;
    } else {
      return definition.create(context);
    }
  }

  async interceptAsync?<T>(definition: AsyncInstanceDefinition<T, any, any>, context: ContainerContext): Promise<T> {
    throw new Error('Implement me!');
  }

  dump() {
    const output = {} as any;
    for (const [id, instance] of Object.entries(this.serializableInstances)) {
      if (isSerializable(instance)) {
        output[id] = instance.dump();
      } else {
        throw new Error('Implement me!');
      }
    }

    return output;
  }

  dumpJSON(): string {
    return JSON.stringify(this.dump());
  }
}
