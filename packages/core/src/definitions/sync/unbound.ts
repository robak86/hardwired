import { LifeTime } from '../abstract/LifeTime.js';

import { BaseDefinition } from '../abstract/BaseDefinition.js';

// TODO: maybe this should be transient by default!!
export function unbound<T, TMeta = unknown>(name: string): BaseDefinition<T, LifeTime.scoped, []> {
  return new BaseDefinition<T, LifeTime.scoped, []>(name, LifeTime.scoped, () => {
    throw new Error(
      `Cannot instantiate unbound definition "${name}". Definition should be provided at the runtime by creating a new scope`,
    );
  });
}
