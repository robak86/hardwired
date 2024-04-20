import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition.js';
import { Resolution } from '../abstract/Resolution.js';

export function implicit<T>(name: string, meta?: object): InstanceDefinition<T, LifeTime.scoped> {
  return new InstanceDefinition<T, LifeTime.scoped>(
    name,
    Resolution.sync,
    LifeTime.scoped,
    () => {
      throw new Error(
        `Cannot instantiate implicit definition "${name}". Definition should be provided at the runtime, by creating new scope`,
      );
    },
    [],
    meta ?? {},
  );
}

export function implicitAsync<T>(name: string, meta?: object): AsyncInstanceDefinition<T, LifeTime.scoped> {
  return asyncDefinition({
    id: name,
    strategy: LifeTime.scoped,
    create: async () => {
      throw new Error(
        `Cannot instantiate implicit definition "${name}". Definition should be provided at the runtime, by creating new scope`,
      );
    },
    meta: meta ?? {},
    dependencies: [],
  });
}
