import { InstanceDefinition, instanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';

export function implicit<T>(
  name: string,
  // ...buildInstanceHash: T extends string | number | boolean ? [] : [(val: T) => string]
): InstanceDefinition<T, LifeTime.scoped> {
  return instanceDefinition({
    strategy: LifeTime.scoped,
    create: () => {
      throw new Error(
        `Cannot instantiate implicit definition "${name}". Definition should be provided at the runtime, by creating new scope`,
      );
    },
  });
}

// const l = implicit<{ a: 1 }>('name', () => 'sdf');
// const l2 = implicit<number>('name');
