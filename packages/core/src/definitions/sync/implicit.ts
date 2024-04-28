import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';

type ImplicitDefinitionBrand = { __implicit: true };

export function implicit<T, TMeta = unknown>(
  name: string,
  meta?: TMeta,
): InstanceDefinition<T, LifeTime.scoped, TMeta & ImplicitDefinitionBrand> {
  return new InstanceDefinition<T, LifeTime.scoped, TMeta & ImplicitDefinitionBrand>(
    name,
    LifeTime.scoped,
    () => {
      throw new Error(
        `Cannot instantiate implicit definition "${name}". Definition should be provided at the runtime, by creating new scope`,
      );
    },

    {
      ...(meta ?? ({} as TMeta)),
      __implicit: true,
    },
  );
}
