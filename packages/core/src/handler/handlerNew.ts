import { PromiseThunk } from '../utils/PromiseThunk';
import { HandlerResult } from './HandlerResult';
import { Handler } from './handler';
import { Reader } from '../reader/reader';

type HandlerNewFn = {
  <TContext, TResponse>(fn: (ctx: {}) => PromiseThunk<HandlerResult<TContext, TResponse>>): Handler<
    {},
    TContext,
    TResponse
  >;

  <TFrom1 extends object, TDep1, TContext, TResponse>(
    using: [Reader<TDep1, TFrom1>],
    returns: (ctx: TFrom1) => PromiseThunk<HandlerResult<TContext, TResponse>>,
  ): Handler<TDep1, TContext, TResponse>;

  <TFrom1 extends object, TFrom2 extends object, TDep1, TDep2, TContext, TResponse>(
    using: [Reader<TDep1, TFrom1>, Reader<TDep2, TFrom2>],
    returns: (ctx: TFrom1 & TFrom2) => PromiseThunk<HandlerResult<TContext, TResponse>>,
  ): Handler<TDep1 & TDep2, TContext, TResponse>;

  <
    TOwnFrom extends object,
    TFrom1 extends object,
    TFrom2 extends object,
    TFrom3 extends object,
    TDep1,
    TDep2,
    TDep3,
    TContext,
    TResponse
  >(
    using: [Reader<TDep1, TFrom1>, Reader<TDep2, TFrom2>, Reader<TDep3, TFrom3>],
    returns: (ctx: TFrom1 & TFrom2 & TFrom3) => PromiseThunk<HandlerResult<TContext, TResponse>>,
  ): Handler<TDep1 & TDep2 & TDep3, TContext, TResponse>;
};

export const handler: HandlerNewFn = (...args) => {
  if (args.length === 1) {
    return new Handler(args[0]); // JUST USE LAST ARG FOR FUCKS SAKE
  }

  if (args.length === 2) {
    return new Handler(args[1]);
  }

  throw new Error('wrong params');
};
