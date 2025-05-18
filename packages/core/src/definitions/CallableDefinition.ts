import type { IContainer } from '../container/IContainer.js';

import type { LifeTime } from './abstract/LifeTime.js';
import { ClassDefinition } from './impl/ClassDefinition.js';
import { TransientDefinition } from './impl/TransientDefinition.js';

export type CallableDefinition<TArgs extends any[], TResult> =
  | ClassDefinition<CallableObject<TArgs, TResult>, LifeTime.transient, TArgs>
  | TransientDefinition<TResult, TArgs>
  | CallableFn<TArgs, TResult>;

export type CallableObject<TArgs extends any[], TResult> = {
  call(...args: TArgs): TResult;
};
export type CallableFn<TArgs extends any[], TResult> = (this: IContainer, ...args: TArgs) => TResult;

export const isCallable = <TArgs extends any[], TReturn>(def: any): def is CallableDefinition<TArgs, TReturn> => {
  if (typeof def === 'function') {
    return true;
  }

  if (def instanceof ClassDefinition && def.isCallable()) {
    return true;
  }

  return def instanceof TransientDefinition;
};
