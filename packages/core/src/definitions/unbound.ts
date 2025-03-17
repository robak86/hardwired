import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './impl/Definition.js';

function executeUnboundDefinition(debugName?: string): never {
  if (debugName) {
    throw new Error(
      `Cannot instantiate unbound definition "${debugName}". Definition should be provided at the runtime by creating a new scope`,
    );
  } else {
    throw new Error(
      `Cannot instantiate unbound definition. Definition should be provided at the runtime by creating a new scope`,
    );
  }
}

export class UnboundDefinition<TInstance, TLifeTime extends LifeTime> extends Definition<TInstance, TLifeTime, []> {
  constructor(
    id: symbol,
    strategy: TLifeTime,
    private _debugName?: string,
  ) {
    super(id, strategy, executeUnboundDefinition.bind(null, _debugName));
  }

  get name() {
    return this._debugName ?? super.name;
  }
}

export function unbound<T>(debugName?: string): UnboundDefinition<T, LifeTime.scoped> {
  return new UnboundDefinition<T, LifeTime.scoped>(Symbol(), LifeTime.scoped, debugName);
}
