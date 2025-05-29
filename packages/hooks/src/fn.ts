import type { IDefinition, IDefinitionToken } from 'hardwired';
import { Definition, LifeTime, MaybeAsync } from 'hardwired';

import { getCurrentContainer, hasCurrentContainer } from './asyncContainerStorage.js';

const transient = <TFunc extends (...args: TArgs) => unknown, TArgs extends any[]>(
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

      return cnt.use(definition).value;
    }

    return fn(...args);
  };

  return Object.setPrototypeOf(containerDelegate, token) as TFunc &
    IDefinitionToken<ReturnType<TFunc>, LifeTime.transient>;
};

// const _lru = () => {
//   throw new Error('Implement me!');
// };

const scoped = <TFunc extends () => any>(fn: TFunc): TFunc & IDefinition<ReturnType<TFunc>, LifeTime.scoped> => {
  const definition: IDefinition<ReturnType<TFunc>, LifeTime.scoped> = new Definition(
    Symbol(fn.name),
    LifeTime.scoped,
    () => MaybeAsync.resolve(fn()),
  );

  const containerDelegate = (): ReturnType<TFunc> => {
    if (!hasCurrentContainer()) {
      return fn();
    }

    const cnt = getCurrentContainer();

    return cnt.use(definition).value as any;
  };

  return Object.setPrototypeOf(containerDelegate, definition) as TFunc &
    IDefinition<ReturnType<TFunc>, LifeTime.scoped>;
};

// TODO: DRY it
const cascading = <TFunc extends () => any>(fn: TFunc): TFunc & IDefinition<ReturnType<TFunc>, LifeTime.cascading> => {
  const definition: IDefinition<ReturnType<TFunc>, LifeTime.cascading> = new Definition(
    Symbol(fn.name),
    LifeTime.cascading,
    () => MaybeAsync.resolve(fn()),
  );

  const containerDelegate = (): ReturnType<TFunc> => {
    if (!hasCurrentContainer()) {
      return fn();
    }

    const cnt = getCurrentContainer();

    return cnt.use(definition).value as any;
  };

  return Object.setPrototypeOf(containerDelegate, definition) as TFunc &
    IDefinition<ReturnType<TFunc>, LifeTime.cascading>;
};

export const fn = Object.assign(transient, {
  scoped,
  cascading,
});
