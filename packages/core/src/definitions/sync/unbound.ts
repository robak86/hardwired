import { LifeTime } from '../abstract/LifeTime.js';

import { Definition } from '../abstract/Definition.js';

// TODO: maybe this should be transient by default!!
export function unbound<T>(name?: string): Definition<T, LifeTime.scoped, []> {
  return new Definition<T, LifeTime.scoped, []>(Symbol(), LifeTime.scoped, () => {
    throw new Error(
      `Cannot instantiate unbound definition "${name}". Definition should be provided at the runtime by creating a new scope`,
    );
  });
}
