import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './impl/Definition.js';

function executeUnboundDefinition(debugName?: string): never {
  const debugNameFragment = debugName ? ` "${debugName}"` : '';

  throw new Error(
    `Cannot instantiate unbound definition${debugNameFragment}.
    You need to bind definition to a value during creation of the container or scope.
    Example: 
    const cnt = container.new(c => c.bind(myUnboundDefinition).toValue(1));`,
  );
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
