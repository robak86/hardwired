import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition.js';

export function implicit<T>(name: string, meta?: object): InstanceDefinition<T, LifeTime.scoped> {
  return InstanceDefinition.create(
    LifeTime.scoped,
    () => {
      throw new Error(
        `Cannot instantiate implicit definition "${name}". Definition should be provided at the runtime, by creating new scope`,
      );
    },
    meta,
  );
}

export function implicitAsync<T>(name: string): AsyncInstanceDefinition<T, LifeTime.scoped> {
  return asyncDefinition({
    strategy: LifeTime.scoped,
    create: async () => {
      throw new Error(
        `Cannot instantiate implicit definition "${name}". Definition should be provided at the runtime, by creating new scope`,
      );
    },
  });
}
