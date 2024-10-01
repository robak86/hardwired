import { LifeTime } from '../abstract/LifeTime.js';
import { Definition } from '../abstract/Definition.js';

function createUnboundDefinition(): never {
  throw new Error(
    `Cannot instantiate unbound definition. Definition should be provided at the runtime by creating a new scope`,
  );
}

export class UnboundDefinition<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> extends Definition<
  TInstance,
  TLifeTime,
  TArgs
> {
  readonly kind = 'unbound';

  constructor(id: symbol, strategy: TLifeTime) {
    super(id, strategy, createUnboundDefinition);
  }
}

// TODO: maybe this should be transient by default!!
export function unbound<T>(): UnboundDefinition<T, LifeTime.scoped, []> {
  return new UnboundDefinition<T, LifeTime.scoped, []>(Symbol(), LifeTime.scoped);
}
