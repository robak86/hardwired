// prettier-ignore
import type {
  AsyncContainerConfigureFn,
  ContainerConfigureFn,
  HasPromise,
  IDefinitionToken,
  LifeTime,
  ReturnTypes,
} from 'hardwired';
import { container, MaybeAsync } from 'hardwired';

import { withContainer } from './asyncContainerStorage.js';
import { use } from './use.js';

// prettier-ignore
export type OnceReturnType<TConfigureFns extends Array<ContainerConfigureFn | AsyncContainerConfigureFn>, TValue> =
  TValue extends Promise<any> ? TValue :
  HasPromise<ReturnTypes<TConfigureFns>> extends true ? Promise<Awaited<TValue>> :
    TValue;

export type OnceReturnTypeCurried<TConfigureFns extends Array<ContainerConfigureFn | AsyncContainerConfigureFn>> = <
  TValueFromCurriedFn,
>(
  token: TokenOrCallback<TValueFromCurriedFn>,
) => OnceReturnType<TConfigureFns, TValueFromCurriedFn>;

type TokenOrCallback<TValue> = IDefinitionToken<TValue, LifeTime> | (() => TValue);

export function once<TValue>(token: TokenOrCallback<TValue>): OnceReturnType<[], TValue>;
export function once<TConfigureFns extends Array<ContainerConfigureFn | AsyncContainerConfigureFn>, TValue>(
  configs: [...TConfigureFns],
  token: TokenOrCallback<TValue>,
): OnceReturnType<TConfigureFns, TValue>;
export function once<TConfigureFns extends Array<ContainerConfigureFn | AsyncContainerConfigureFn>>(
  configs: [...TConfigureFns],
): <TValueFromCurriedFn>(
  token: TokenOrCallback<TValueFromCurriedFn>,
) => OnceReturnType<TConfigureFns, TValueFromCurriedFn>;
export function once<TConfigureFns extends Array<ContainerConfigureFn | AsyncContainerConfigureFn>, TValue>(
  configsOrToken: [...TConfigureFns] | TokenOrCallback<TValue>,
  token?: TokenOrCallback<TValue>,
): OnceReturnType<TConfigureFns, TValue> | OnceReturnTypeCurried<TConfigureFns> {
  if (Array.isArray(configsOrToken) && !token) {
    const cnt = MaybeAsync.resolve(container(...configsOrToken));

    const curried = <TValue>(token: IDefinitionToken<TValue, LifeTime> | (<TReturn>() => TReturn)) => {
      return cnt
        .then(c => {
          if (typeof token === 'function') {
            return withContainer(c, token);
          }

          return withContainer(c, () => use(token));
        })
        .unwrap() as OnceReturnType<TConfigureFns, TValue>;
    };

    return curried as OnceReturnTypeCurried<TConfigureFns>;
  }

  if (Array.isArray(configsOrToken) && token) {
    const cnt = MaybeAsync.resolve(container(...configsOrToken));

    return cnt
      .then(c => {
        if (typeof token === 'function') {
          return withContainer(c, token);
        }

        return withContainer(c, () => use(token));
      })
      .unwrap() as OnceReturnType<TConfigureFns, TValue>;
  }

  if (!Array.isArray(configsOrToken)) {
    const cnt = container();

    if (typeof configsOrToken === 'function') {
      return withContainer(cnt, configsOrToken) as OnceReturnType<TConfigureFns, TValue>;
    }

    return withContainer(cnt, () => use(configsOrToken)) as OnceReturnType<TConfigureFns, TValue>;
  }

  throw new Error('Invalid arguments.');
}
