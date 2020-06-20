import { Handler } from './handler';

export type IsOptional<T> = T | undefined extends T ? 'optional' : 'required';

// prettier-ignore
export type SwitchReturn2<T1, T2> =
    IsOptional<T1> extends 'required' ? T1 :
        IsOptional<T2> extends 'required' ? NonNullable<T1 | T2> :
            T1 | T2 | undefined

export type SwitchReturn3<T1, T2, T3> = IsOptional<T1> extends 'required' ? T1 : SwitchReturn2<T2, T3>;
export type SwitchReturn4<T1, T2, T3, T4> = IsOptional<T1> extends 'required' ? T1 : SwitchReturn3<T2, T3, T4>;

export type SwitchHandlersFn = {
  <TInput1, TInput2, TContext1, TContext2, TResponse1, TResponse2>(
    ...handlers: [Handler<TInput1, TContext1, TResponse1>, Handler<TInput2, TContext2, TResponse2>]
  ): Handler<TInput1 & TInput2, TInput1 & TInput2, SwitchReturn2<TResponse1, TResponse2>>;

  <TInput1, TInput2, TInput3, TContext1, TContext2, TContext3, TResponse1, TResponse2, TResponse3>(
    ...handlers: [
      Handler<TInput1, TContext1, TResponse1>,
      Handler<TInput2, TContext2, TResponse2>,
      Handler<TInput3, TContext3, TResponse3>,
    ]
  ): Handler<
    TInput1 & TInput2 & TInput3,
    TInput1 & TInput2 & TInput3,
    SwitchReturn3<TResponse1, TResponse2, TResponse3>
  >;

  <
    TInput1,
    TInput2,
    TInput3,
    TInput4,
    TContext1,
    TContext2,
    TContext3,
    TContext4,
    TResponse1,
    TResponse2,
    TResponse3,
    TResponse4
  >(
    ...handlers: [
      Handler<TInput1, TContext1, TResponse1>,
      Handler<TInput2, TContext2, TResponse2>,
      Handler<TInput3, TContext3, TResponse3>,
      Handler<TInput4, TContext4, TResponse4>,
    ]
  ): Handler<
    TInput1 & TInput2 & TInput3 & TInput4,
    TInput1 & TInput2 & TInput3 & TInput4,
    SwitchReturn4<TResponse1, TResponse2, TResponse3, TResponse4>
  >;
};

export const switchHandlers: SwitchHandlersFn = null as any;
