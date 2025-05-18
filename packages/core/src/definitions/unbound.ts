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

export class UnboundDefinition<TInstance> extends Definition<TInstance, LifeTime, []> {
  public readonly kind!: 'unbound'; // TODO: hack to make it distinguishable from other definitions

  constructor(
    id: symbol,
    private _debugName?: string,
  ) {
    super(id, LifeTime.scoped, executeUnboundDefinition.bind(null, _debugName));
  }

  get name() {
    return this._debugName ?? super.name;
  }
}

export function unbound<T>(debugName?: string): UnboundDefinition<T> {
  return new UnboundDefinition<T>(Symbol(), debugName);
}
