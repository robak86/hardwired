import { AsyncInstanceDefinition, ContainerContext, ContainerInterceptor, InstanceDefinition } from 'hardwired';
import { isHydratable } from './HydrateAwareState.js';

export class HydrationInterceptor implements ContainerInterceptor {
  private hydratableInstances: Record<string, any> = {};

  constructor(private restoreFrom?: Record<string, any>) {}

  interceptSync?<T>(definition: InstanceDefinition<T, any>, context: ContainerContext): T {
    if (definition.meta.hydratable) {
      const instance = definition.create(context);
      if (Object.prototype.hasOwnProperty.call(this.hydratableInstances, definition.id)) {
        throw new Error(`Hydratable instance ${definition.id} already exists. There is a probably an id collision.`);
      }

      this.hydratableInstances[definition.id] = instance;

      if (this.restoreFrom && Object.prototype.hasOwnProperty.call(this.restoreFrom, definition.id)) {
        if (isHydratable(instance)) {
          instance.setState(this.restoreFrom[definition.id]);
        } else {
          throw new Error(`Trying to restore non-serializable instance ${definition.id}`);
        }
      }

      return instance;
    } else {
      return definition.create(context);
    }
  }

  async interceptAsync?<T>(definition: AsyncInstanceDefinition<T, any>, context: ContainerContext): Promise<T> {
    throw new Error('Implement me!');
  }

  dump() {
    const output = {} as any;
    for (const [id, instance] of Object.entries(this.hydratableInstances)) {
      if (isHydratable(instance)) {
        output[id] = instance.state;
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
