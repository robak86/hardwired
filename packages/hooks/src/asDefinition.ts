import type { IDefinitionToken } from 'hardwired';
import { Definition, LifeTime, MaybeAsync } from 'hardwired';

import { getCurrentContainer, hasCurrentContainer } from './asyncContainerStorage.js';

export const asDefinition = <TFunc extends (...args: TArgs) => unknown, TArgs extends any[]>(
  fn: TFunc,
): TFunc & IDefinitionToken<ReturnType<TFunc>, LifeTime.transient> => {
  const token = {
    id: Symbol(fn.name),
    strategy: LifeTime.transient,
  } as IDefinitionToken<ReturnType<TFunc>, LifeTime.transient>;

  const containerDelegate = (...args: TArgs) => {
    if (!hasCurrentContainer()) {
      return fn(...args);
    }

    const cnt = getCurrentContainer();

    if (cnt.has(token)) {
      const definition = new Definition(token.id, LifeTime.transient, () => MaybeAsync.resolve(fn(...args)));

      return cnt.use(definition);
    }

    return fn(...args);
  };

  return Object.setPrototypeOf(containerDelegate, token) as TFunc &
    IDefinitionToken<ReturnType<TFunc>, LifeTime.transient>;
};
