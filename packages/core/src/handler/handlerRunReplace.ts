import { Handler } from './handler';
import { LensProvide } from '../lens';

export type HandlerRunReplace = {
  <TInput extends object, TFrom, TReturn>(
    trait: Handler<TInput, TFrom, TReturn>,
    provides: LensProvide<Partial<TInput>>[],
    value: TInput,
  ): TFrom;

  <TInput extends object, TFrom, TReturn>(
    trait: Handler<TInput, TFrom, TReturn>,
    provides: LensProvide<Partial<TInput>>[],
  ): (value: TInput) => TFrom;

  <TInput extends object, TFrom, TReturn>(trait: Handler<TInput, TFrom, TReturn>): (
    provides: LensProvide<Partial<TInput>>[],
    value: TInput,
  ) => TFrom;

  <TInput extends object, TFrom, TReturn>(trait: Handler<TInput, TFrom, TReturn>): (
    provides: LensProvide<Partial<TInput>>[],
  ) => (value: TInput) => TFrom;
};

// TODO: not sure if this is even usable
// export const handlerRunReplace: HandlerRunReplace = curryN(3, (handler: any, provides, value) => {
//   const prevValue:any = handler.prev && handlerRunReplace(handler.prev, provides, value);
//
//   if (HandlerResult.isAbortPass(prevValue)) {
//     return prevValue;
//   }
//
//   if (HandlerResult.isResponse(prevValue)) {
//     return prevValue;
//   }
//
//   if (HandlerResult.isContextPass(prevValue)) {
//     return Handler.run(prevValue.context as any);
//   }
//
//   return Handler.run(value);
// });
