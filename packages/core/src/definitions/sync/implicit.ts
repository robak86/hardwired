import { LifeTime } from '../abstract/LifeTime.js';

import { BaseDefinition } from '../abstract/BaseDefinition.js';

// TODO: maybe this should be transient by default!!
export function implicit<T, TMeta = unknown>(
  name: string,
  meta?: TMeta,
): BaseDefinition<T, LifeTime.scoped, TMeta, []> {
  return new BaseDefinition<T, LifeTime.scoped, TMeta, []>(
    name,
    LifeTime.scoped,
    () => {
      throw new Error(
        `Cannot instantiate implicit definition "${name}". Definition should be provided at the runtime, by creating new scope`,
      );
    },
    meta,
  );
}
