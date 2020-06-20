import { Handler } from './handler';
import { SwitchReturn2, SwitchReturn3, SwitchReturn4 } from './switchHandlers';

export type HandlerPipeFn = {
  // <TInput, TContext1, TContext2, TContext3, TContext4, TContext5, TResponse>(
  //   handlers: [
  //     Handler<TInput, TContext1, undefined>,
  //     Handler<TContext1, TContext2, undefined>,
  //     Handler<TContext2, TContext3, undefined>,
  //     Handler<TContext3, TContext4, undefined>,
  //     Handler<TContext4, TContext5, TResponse>,
  //   ],
  // ): Handler<TInput, TContext5, TResponse>;

  <TInput, TContext1, TContext2, TContext3, TContext4, TResponse1, TResponse2, TResponse3, TResponse4>(
    ...handlers: [
      Handler<TInput, TContext1, TResponse1>,
      Handler<TContext1, TContext2, TResponse2>,
      Handler<TContext2, TContext3, TResponse3>,
      Handler<TContext3, TContext4, TResponse4>,
    ]
  ): Handler<TInput, TContext4, SwitchReturn4<TResponse1, TResponse2, TResponse3, TResponse4>>;
  //
  <TInput, TContext1, TContext2, TContext3, TResponse1, TResponse2, TResponse3>(
    ...handlers: [
      Handler<TInput, TContext1, TResponse1>,
      Handler<TContext1, TContext2, TResponse2>,
      Handler<TContext2, TContext3, TResponse3>,
    ]
  ): Handler<TInput, TContext3, SwitchReturn3<TResponse1, TResponse2, TResponse3>>;

  <TInput, TContext1, TContext2, TResponse1, TResponse2>(
    ...handlers: [Handler<TInput, TContext1, TResponse1>, Handler<TContext1, TContext2, TResponse2>]
  ): Handler<TInput, TContext2, SwitchReturn2<TResponse1, TResponse2>>;
};

export const handlerPipe: HandlerPipeFn = (...handlers: Handler<any, any, any>[]) => {
  return handlers.reduce((composed: any, current: any) => {
    return {
      ...current,
      prev: composed,
    };
  });
};
