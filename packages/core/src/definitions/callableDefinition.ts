import type { IContainer } from '../container/IContainer.js';

import type { LifeTime } from './abstract/LifeTime.js';
import type { ClassDefinition } from './impl/ClassDefinition.js';
import type { TransientDefinition } from './impl/TransientDefinition.js';

export type CallableDefinition<TArgs extends any[], TResult> =
  | ClassDefinition<ObjectCallable<TArgs, TResult>, LifeTime.transient, TArgs>
  | TransientDefinition<FnCreate<TArgs, TResult>, TArgs>
  | FnCallable<TArgs, TResult>;

export type ObjectCallable<TArgs extends any[], TResult> = {
  call(...args: TArgs): TResult;
};
export type FnCallable<TArgs extends any[], TResult> = (this: IContainer, ...args: TArgs) => TResult;
export type FnCreate<TArgs extends any[], TResult> = (container: IContainer, ...args: TArgs) => Promise<TResult>;
