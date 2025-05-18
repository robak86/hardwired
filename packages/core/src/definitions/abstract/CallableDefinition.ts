import type { IContainer } from '../../container/IContainer.js';
import { ClassDefinition } from '../impl/ClassDefinition.js';
import { TransientDefinition } from '../impl/TransientDefinition.js';

import type { LifeTime } from './LifeTime.js';
import type { IDefinition } from './IDefinition.js';

export type CallableDefinition<TArgs extends any[], TResult> =
  | IDefinition<CallableObject<TArgs, TResult>, LifeTime.transient, any>
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
